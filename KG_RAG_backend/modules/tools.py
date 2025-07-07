from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import RootModel
from typing import Dict, List
import os
from .data_loader import PDFLoader
from langchain_neo4j import Neo4jGraph, GraphCypherQAChain
from config import (
    NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD,
    TOGETHER_API_KEY, TOGETHER_API_BASE, LLM_MODEL, LLM_TEMPERATURE
)

class EntityResponse(RootModel[Dict[str, List[str]]]):
    pass

class SearchTools:
    def __init__(self, username: str = None):
        self.username = username
        
        # Initialize vector store
        if username:
            pdf_dir = f"data/pdfs/{username}"
            self.pdf_loader = PDFLoader(pdf_dir=pdf_dir, username=username)
            if not self.pdf_loader.load_index():
                print("Warning: No vector store found. Please process PDFs first.")
        else:
            print("Warning: No username provided. Vector store will not be initialized.")
            self.pdf_loader = None
        
        # Initialize Neo4j graph
        self.graph = Neo4jGraph(
            url=NEO4J_URI,
            username=NEO4J_USERNAME,
            password=NEO4J_PASSWORD
        )
        
        # Initialize LLM for Cypher generation
        os.environ["TOGETHER_API_KEY"] = TOGETHER_API_KEY
        self.llm = ChatOpenAI(
            temperature=LLM_TEMPERATURE,
            openai_api_key=TOGETHER_API_KEY,
            openai_api_base=TOGETHER_API_BASE,
            model_name=LLM_MODEL,
        )
        
        # Initialize Cypher QA Chain
        self.cypher_chain = GraphCypherQAChain.from_llm(
            llm=self.llm,
            graph=self.graph,
            verbose=True,
            allow_dangerous_requests=True
        )
        
        # Initialize NER parser
        self.parser = PydanticOutputParser(pydantic_object=EntityResponse)
        self.format_instructions = self.parser.get_format_instructions()
        
        # Initialize NER prompt
        self.ner_prompt = PromptTemplate(
            template="""
            Extract key scientific concepts and technical terms from the following text. Focus on:
            1. Technical components and architectures
            2. Methods and techniques
            3. Models and frameworks
            4. Important concepts and terminology
            
            Return only a JSON object with a single key "entities" containing a list of extracted entities.
            Be concise and specific in entity extraction.
            
            Text: {text}
            
            {format_instructions}
            """,
            input_variables=['text'],
            partial_variables={"format_instructions": self.format_instructions}
        )
        
        self.ner_chain = self.ner_prompt | self.llm | self.parser

    def get_relevant_chunks_from_graph(self, query: str, k: int = 3) -> List[Dict]:
        """
        Get most relevant chunks from the knowledge graph based on entity relationships.
        
        Args:
            query: The search query
            k: Number of results to return
            
        Returns:
            List of dictionaries containing chunk information
        """
        try:
            # Extract entities from query
            query_entities = self.extract_entities(query)
            
            # Construct Cypher query for finding similar nodes and their connections
            cypher_query = """
            MATCH (e:Entity)
            WHERE e.name IN $entities
            WITH e
            MATCH (e)-[r:RELATED_TO]-(related:Entity)
            WITH e, related, r
            ORDER BY r.count DESC
            LIMIT $k
            RETURN e.name as entity_name,
                   e.chunk_ids as entity_chunks,
                   collect({
                       name: related.name,
                       chunks: related.chunk_ids,
                       relationship_count: r.count
                   }) as related_entities
            """
            
            # Execute query
            results = self.graph.query(
                cypher_query,
                params={"entities": query_entities, "k": k}
            )
            
            # Process results
            relevant_chunks = []
            for result in results:
                entity_name = result['entity_name']
                entity_chunks = result['entity_chunks']
                related_entities = result['related_entities']
                
                # Add main entity chunks
                relevant_chunks.append({
                    'chunk_id': entity_chunks[0] if entity_chunks else None,
                    'entity': entity_name,
                    'related_entities': [r['name'] for r in related_entities],
                    'relationship_count': sum(r['relationship_count'] for r in related_entities),
                    'is_main_context': True
                })
                
                # Add related entity chunks
                for related in related_entities:
                    if related['chunks']:
                        relevant_chunks.append({
                            'chunk_id': related['chunks'][0],
                            'entity': related['name'],
                            'related_entities': [entity_name],
                            'relationship_count': related['relationship_count'],
                            'is_main_context': False
                        })
            
            # Sort by relationship count and return top k
            relevant_chunks.sort(key=lambda x: x['relationship_count'], reverse=True)
            return relevant_chunks[:k]
            
        except Exception as e:
            print(f"Error getting relevant chunks from graph: {str(e)}")
            return []

    def search_similar_chunks(self, query: str, k: int = 3) -> List[Dict]:
        """
        Search for similar chunks using the vector store.
        
        Args:
            query: The search query
            k: Number of results to return
            
        Returns:
            List of dictionaries containing similar chunks and their metadata
        """
        try:
            if not self.pdf_loader or not self.pdf_loader.vector_store:
                print("Warning: Vector store not initialized. Please process PDFs first.")
                return []
            return self.pdf_loader.search_similar(query, k=k)
        except Exception as e:
            print(f"Error searching similar chunks: {str(e)}")
            return []

    def extract_entities(self, text: str) -> List[str]:
        """
        Extract entities from the given text using the NER model.
        
        Args:
            text: The text to extract entities from
            
        Returns:
            List of extracted entities
        """
        try:
            response = self.ner_chain.invoke({"text": text})
            return response.root.get('entities', [])
        except Exception as e:
            print(f"Error extracting entities: {str(e)}")
            return []

    def close(self):
        """Close connections to external services."""
        self.graph.close() 