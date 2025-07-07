from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import os
from modules.tools import SearchTools
from config import (
    NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD,
    TOGETHER_API_KEY, TOGETHER_API_BASE, LLM_MODEL, LLM_TEMPERATURE
)

class SearchAgent:
    def __init__(self, username: str = None):
        # Initialize tools with username
        self.tools = SearchTools(username=username)
        
        # Initialize LLM
        os.environ["TOGETHER_API_KEY"] = TOGETHER_API_KEY
        self.llm = ChatOpenAI(
            temperature=LLM_TEMPERATURE,
            openai_api_key=TOGETHER_API_KEY,
            openai_api_base=TOGETHER_API_BASE,
            model_name=LLM_MODEL,
        )
        
        # Initialize prompt
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a research assistant that helps find relevant information from scientific documents.
            You have access to three types of information:
            1. Vector search results: Similar text chunks based on semantic similarity
            2. Graph search results: Chunks connected through entity relationships
            3. Extracted entities: Key concepts from the query
            
            Your task is to:
            1. Analyze the search results from both vector and graph search
            2. Identify the most relevant chunks based on both semantic similarity and entity relationships
            3. Provide a clear, concise answer that synthesizes information from the most relevant chunks
            4. Give the answer based on the entity linking from the Knowledge Graph functionality provided
            5. Include relevant entity relationships when they provide additional context
            6. Explain the relation between the different entities from different chunks and their relationship
            
            Guidelines:
            - Be concise and avoid repetition
            - Focus on the most relevant information
            - Use clear, technical language
            - Connect related concepts when relevant
            
            Format your response as:
            Give a summarised synthesized answer with the additional context from related entities
            Referenced from: [list of (document: 0,page: 0), (document: 2,page: 5), .. based on d00p00c0000 where d implies document and p implies page]
            """),
            ("user", """Query: {query}
            
            Vector Search Results:
            {vector_results}
            
            Graph Search Results:
            {graph_results}
            
            Extracted Entities:
            {entities}
            """)
        ])
        
        # Initialize chain
        self.chain = self.prompt | self.llm | StrOutputParser()

    def search(self, query: str, k: int = 3):
        """
        Perform a comprehensive search using both vector and graph search.

        Args:
            query: The search query
            k: Number of results to return from each search method

        Returns:
            A comprehensive response synthesizing information from both search methods
        """
        try:
            # Get results from different search methods
            vector_results = self.tools.search_similar_chunks(query, k=k)
            graph_results = self.tools.get_relevant_chunks_from_graph(query, k=k)
            entities = self.tools.extract_entities(query)

            # Format results for the prompt
            vector_results_str = "\n".join([
                f"Chunk {r['metadata']['chunk_id']}: {r['text']} (Score: {r['score']})"
                for r in vector_results
            ]) if vector_results else "No vector search results found."

            graph_results_str = "\n".join([
                f"Chunk {r['chunk_id']}: Entity '{r['entity']}' with related entities: {', '.join(r['related_entities'])}"
                for r in graph_results
            ]) if graph_results else "No graph search results found."

            entities_str = ", ".join(entities) if entities else "No entities extracted."

            # Generate response
            response = self.chain.invoke({
                "query": query,
                "vector_results": vector_results_str,
                "graph_results": graph_results_str,
                "entities": entities_str
            })

            return response

        except Exception as e:
            print(f"Error performing search: {str(e)}")
            return "An error occurred while processing your query."

    def close(self):
        """Close connections to external services."""
        self.tools.close() 