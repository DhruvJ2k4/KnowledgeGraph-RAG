import json
from pathlib import Path
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document
from config import CHUNK_SIZE, CHUNK_OVERLAP

class PDFLoader:
    def __init__(self, 
                 pdf_dir: str,
                 username: str,
                 chunk_size: int = CHUNK_SIZE,
                 chunk_overlap: int = CHUNK_OVERLAP):
        self.pdf_dir = Path(pdf_dir)
        self.username = username
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.vector_store = None
        
        # Set up user-specific paths for chunks and vector store
        self.chunks_dir = Path(f"data/chunks/{username}")
        self.vector_store_dir = Path(f"data/vector_stores/{username}")
        self.chunks_dir.mkdir(parents=True, exist_ok=True)
        self.vector_store_dir.mkdir(parents=True, exist_ok=True)
        self.output_file = self.chunks_dir / f"chunks_{username}.jsonl"
        self.vector_store_path = self.vector_store_dir / "vector_store"
            
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )

        self.chunker = RecursiveCharacterTextSplitter(
            separators=["\n\n", "\n", ".", ",", " "],
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len
        )

    def load_index(self):
        """Load a FAISS index from disk."""
        try:
            if not self.vector_store_path.exists():
                print(f"No vector store found at {self.vector_store_path}")
                return False
                
            self.vector_store = FAISS.load_local(
                str(self.vector_store_path), 
                self.embeddings,
                allow_dangerous_deserialization=True
            )
            print(f"Loaded vector store from {self.vector_store_path}")
            return True
        except Exception as e:
            print(f"Error loading vector store: {str(e)}")
            return False

    async def load_pdfs(self):
        """Load PDFs, create chunks, and build vector store."""
        pdf_files = list(self.pdf_dir.glob("*.pdf"))
        if not pdf_files:
            print(f"No PDF files found in {self.pdf_dir}")
            return
            
        all_chunks = []
        print(f"Processing {len(pdf_files)} PDF files...")

        with open(self.output_file, "w", encoding="utf-8") as out:
            for doc_id, pdf_path in enumerate(pdf_files):
                print(f"\nProcessing {pdf_path.name}...")
                loader = PyPDFLoader(str(pdf_path), mode="page")
                docs = await loader.aload()

                pg = 0
                total_chunks = 0
                skip = False

                for doc in docs:
                    pg += 1
                    text = doc.page_content.strip()

                    if not text or skip:
                        continue

                    lines = text.lower().splitlines()
                    for l in lines:
                        if l.startswith("reference") or l.startswith("references") or l.startswith("bibliography") or l.startswith("acknowledgements"):
                            skip = True
                            break

                    if skip:
                        continue

                    chunks = self.chunker.split_text(text)
                    for i, chunk in enumerate(chunks):
                        data = {
                            "chunk_id": f"d{doc_id:02}p{pg:04}c{i+1:02}",
                            "doc_id": doc_id+1,
                            "doc": pdf_path.name,
                            "page": pg,
                            "text": chunk.strip()
                        }
                        total_chunks += 1
                        json.dump(data, out, ensure_ascii=False)
                        out.write("\n")
                        all_chunks.append(data)
                        
                print(f"Document: {doc_id+1}\nPages: {pg}\nChunks: {total_chunks}")

        print(f"\nSaving {len(all_chunks)} chunks to {self.output_file}")

        # Create vector store
        if all_chunks:
            try:
                print("\nCreating vector store...")
                # Create documents for FAISS
                documents = []
                for chunk in all_chunks:
                    documents.append(Document(
                        page_content=chunk['text'],
                        metadata={
                            'chunk_id': chunk['chunk_id'],
                            'doc_id': chunk['doc_id'],
                            'doc': chunk['doc'],
                            'page': chunk['page']
                        }
                    ))

                # Create and save FAISS vector store
                self.vector_store = FAISS.from_documents(
                    documents,
                    self.embeddings
                )
                
                # Save vector store
                self.vector_store.save_local(str(self.vector_store_path))
                print(f"Vector store saved to {self.vector_store_path}")

            except Exception as e:
                print(f"Error creating vector store: {str(e)}")
                raise

    def search_similar(self, query: str, k: int = 4):
        """Search for similar chunks using the vector store."""
        if not self.vector_store:
            if not self.load_index():
                raise ValueError("Vector store not initialized. Please load PDFs first.")
        
        results = self.vector_store.similarity_search_with_score(query, k=k)
        return [
            {
                'text': doc.page_content,
                'metadata': doc.metadata,
                'score': score
            }
            for doc, score in results
        ]