from langchain_openai.chat_models import ChatOpenAI
import os
import json
from pathlib import Path
import time
#from langchain_ollama import OllamaLLM
from langchain_core.output_parsers import JsonOutputParser, PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from config import CHUNK_STORE, BLOCK_SIZE, MODEL, PROMPT, ENTITY_PATH

from pydantic import RootModel
from typing import Dict, List
from config import (
    NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD,
    TOGETHER_API_KEY, TOGETHER_API_BASE, LLM_MODEL, LLM_TEMPERATURE
)

class EntityResponse(RootModel[Dict[str, List[str]]]):
    pass

class Chunks_NER:
    def __init__(self, username: str):
        self.username = username
        print(f"[Chunks_NER] Initializing for user: {username}")
        
        # Initialize LLM with proper configuration
        try:
            print("[Chunks_NER] Attempting to initialize LLM...")
            # Add your API key here or load from env
            os.environ["TOGETHER_API_KEY"] = TOGETHER_API_KEY
            self.llm = ChatOpenAI(
                temperature=LLM_TEMPERATURE,
                openai_api_key=TOGETHER_API_KEY,
                openai_api_base=TOGETHER_API_BASE,
                model_name=LLM_MODEL,
            )
            print(f"[Chunks_NER] Successfully initialized LLM with model: {LLM_MODEL}")
        except Exception as e:
            print(f"[Chunks_NER ERROR] Error initializing LLM: {str(e)}")
            raise
        
        # Create parser and format instructions
        self.parser = PydanticOutputParser(pydantic_object=EntityResponse)
        format_instructions = self.parser.get_format_instructions()
        print("[Chunks_NER] Parser and format instructions created.")
        
        # Create prompt template with format instructions
        self.prompt_template = PromptTemplate(
            template=PROMPT + "\n{format_instructions}",
            input_variables=['known_entities', 'batch_texts'],
            partial_variables={"format_instructions": format_instructions}
        )
        print("[Chunks_NER] Prompt template created.")
        
        # Chain the components
        self.chain = self.prompt_template | self.llm | self.parser
        print("[Chunks_NER] Chain created.")
        
        # Create necessary directories
        self.chunks_dir = Path(f"data/chunks/{username}")
        self.entities_dir = Path(f"data/entities/{username}")
        self.chunks_dir.mkdir(parents=True, exist_ok=True)
        self.entities_dir.mkdir(parents=True, exist_ok=True)
        print(f"[Chunks_NER] Directories ensured: chunks at {self.chunks_dir}, entities at {self.entities_dir}")
        
        # Set file paths
        self.chunks_file = self.chunks_dir / f"chunks_{username}.jsonl"
        self.entities_file = self.entities_dir / f"entities_{username}.json"
        print(f"[Chunks_NER] File paths set: chunks={self.chunks_file}, entities={self.entities_file}")

    def load_chunks(self):
        print(f"[Chunks_NER] Loading chunks from {self.chunks_file}...")
        try:
            if not self.chunks_file.exists():
                print(f"[Chunks_NER] No chunks file found at {self.chunks_file}")
                return []
                
            chunks = []
            with open(self.chunks_file, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        data = json.loads(line)
                        chunks.append([data["chunk_id"], data["text"]])
            print(f"[Chunks_NER] Loaded {len(chunks)} chunks from {self.chunks_file}")
            return chunks
        except Exception as e:
            print(f"[Chunks_NER ERROR] Error loading chunks: {e}")
            return []

    def Extract_Entities(self):
        print("[Chunks_NER] Starting entity extraction...")
        entities = set()
        chunks = self.load_chunks()
        if not chunks:
            print("[Chunks_NER] No chunks found to process, exiting extraction.")
            return list(entities)
            
        dump = dict()
        
        # Open the file once after processing all chunks
        for i in range(0, len(chunks), BLOCK_SIZE):
            start = time.time()
            batch = chunks[i:i + BLOCK_SIZE]
            print(f"[Chunks_NER] Processing batch {i // BLOCK_SIZE + 1}/{len(chunks) // BLOCK_SIZE + 1} with {len(batch)} texts.")
            
            prompt_input = {
                "known_entities": list(entities)[-100:],
                "batch_texts": "\n".join([f"{cid}: {text}" for cid, text in batch])
            }
            print(f"[Chunks_NER] Prompt input for batch {i // BLOCK_SIZE + 1}: {prompt_input['batch_texts'][:100]}...") # Print first 100 chars of batch_texts

            try:
                print(f"[Chunks_NER] Invoking LLM chain for batch {i // BLOCK_SIZE + 1}...")
                response = self.chain.invoke(prompt_input)
                
                # Debug print the response
                print(f"[Chunks_NER] Response type: {type(response)}")
                print(f"[Chunks_NER] Response content: {response}")
                
                if not response or not response.root:
                    print(f"[Chunks_NER WARNING] Empty or invalid response for batch {i // BLOCK_SIZE + 1}")
                    continue
                    
                for chunk_id, entity_list in response.root.items():
                    if not entity_list:  # Skip empty entity lists
                        continue
                    normalized = [e.strip().lower() for e in entity_list if e.strip()]
                    if normalized:  # Only add if there are valid entities
                        dump[chunk_id] = normalized
                        entities.update(normalized)
                print(f"[Chunks_NER] Entities processed for batch {i // BLOCK_SIZE + 1}.")
                
            except Exception as e:
                print(f"[Chunks_NER ERROR] Error processing batch {i // BLOCK_SIZE + 1}: {str(e)}")
                # Optionally, log the full traceback here for more detailed debugging
                # import traceback
                # traceback.print_exc()
                continue
            
            end = time.time()
            print(f"[Chunks_NER] Batch {i // BLOCK_SIZE + 1} took {end - start:.2f} seconds")

        if dump:  # Only write if we have entities
            with open(self.entities_file, "w", encoding="utf-8") as f:
                json.dump(dump, f, indent=2, ensure_ascii=False)
            print(f"[Chunks_NER] Saved {len(dump)} chunks with entities to {self.entities_file}")
        else:
            print("[Chunks_NER WARNING] No entities were extracted from any chunks. No file written.")
                
        print("[Chunks_NER] Entity extraction completed. Total unique entities: {len(entities)}")
        return list(entities)  # Return the list of unique entities 