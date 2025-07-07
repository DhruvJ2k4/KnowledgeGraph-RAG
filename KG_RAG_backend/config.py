from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
load_dotenv()  # Load .env file

class Settings(BaseSettings):
    # Database settings
    database_hostname: str 
    database_port: str 
    database_password: str
    database_name: str
    database_username: str
    
    # JWT settings
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    
    # PDF Processing settings
    pdf_dir: str = "./data/pdfs"
    chunk_store: str = "./data/chunks/{username}/chunks_{username}.jsonl"
    vector_store: str = "./data/pdfs/vector_store"
    chunk_size: int = 800
    chunk_overlap: int = 300
    
    # NER Model settings
    model: str = "mistral"
    block_size: int = 5
    entity_path: str = "./data/entities/{username}/entities_{username}.json"
    
    
    # API settings
    together_api_key: str
    together_api_base: str = "https://api.together.xyz/v1"
    llm_model: str = "mistralai/Mistral-7B-Instruct-v0.2"
    llm_temperature: float = 0.7
    
    # Neo4j settings
    neo4j_uri: str
    neo4j_username: str
    neo4j_password: str
    
    # Vector store settings
    vector_index: str = "./data/pdfs/vector_index"
    emb_model: str = "sentence-transformers/all-MiniLM-L6-v2"

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

settings = Settings()


# Export settings as module-level variables
PDF_DIR = Path(settings.pdf_dir)
CHUNK_STORE = Path(settings.chunk_store)
VECTOR_STORE = Path(settings.vector_store)
CHUNK_SIZE = settings.chunk_size
CHUNK_OVERLAP = settings.chunk_overlap
MODEL = settings.model
BLOCK_SIZE = settings.block_size
ENTITY_PATH = Path(settings.entity_path)
TOGETHER_API_KEY = settings.together_api_key
TOGETHER_API_BASE = settings.together_api_base
LLM_MODEL = settings.llm_model
LLM_TEMPERATURE = settings.llm_temperature
NEO4J_URI = settings.neo4j_uri
NEO4J_USERNAME = settings.neo4j_username
NEO4J_PASSWORD = settings.neo4j_password
VECTOR_INDEX = Path(settings.vector_index)
EMB_MODEL = settings.emb_model

PROMPT = """
  You are an NLP researcher assistant helping extract scientific concepts from text chunks
  to populate a knowledge graph. You will be given:

  1. A list of previously extracted scientific concept names ("known_entities")
  2. A set of labeled paragraph chunks from scientific papers, with chunkIDs and chunk text as such:
      {{
      "d01p0000c01": "Text of the first chunk...",
      "d01p0000c02": "Text of the second chunk...",
      ...
      }}

  Your task:
  - Extract key scientific concepts (e.g., methods, models, datasets, techniques).
  - For each chunk, return a list of normalized entities.
  - If a new concept is similar to one in known_entities (e.g., "Vision-Language Model" vs "vision language"),
    reuse the known entity name to ensure consistency and reduce duplication.
  - Your output must be a valid JSON object with all chunk IDs present.

  Instructions:
  1. Do not include any explanations or comments in your response.
  2. If a chunk has no entities, return an empty list for it.
  3. Format must be valid JSON. Output only the JSON.
  4. You must extract entities from **every single chunk**.
  5. Use previously seen entity names from the known_entities list when possible.

  Input:
  - Known entities: {known_entities}
  - Text chunks: {batch_texts}

  Return output like:
  {{
    "d01p0000c01": ["transformer", "bert"],
    "d01p0000c02": ["language model"],
    ...
  }}
"""
