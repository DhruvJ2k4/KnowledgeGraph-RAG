# KnowledgeGraph-RAG

[![CI](https://github.com/DhruvJ2k4/KnowledgeGraph-RAG/actions/workflows/ci.yml/badge.svg)](https://github.com/DhruvJ2k4/KnowledgeGraph-RAG/actions)
[![Coverage Status](https://coveralls.io/repos/github/DhruvJ2k4/KnowledgeGraph-RAG/badge.svg?branch=main)](https://coveralls.io/github/DhruvJ2k4/KnowledgeGraph-RAG?branch=main)
[![Version](https://img.shields.io/github/v/release/DhruvJ2k4/KnowledgeGraph-RAG)](https://github.com/DhruvJ2k4/KnowledgeGraph-RAG/releases)
[![License](https://img.shields.io/github/license/DhruvJ2k4/KnowledgeGraph-RAG)](LICENSE)

---

## 🚀 Project Overview

**KnowledgeGraph-RAG** is an advanced, open-source system for Retrieval-Augmented Generation (RAG) using knowledge graphs and Large Language Models (LLMs). By extracting structured knowledge from PDFs and scientific papers, it enables explainable, multilingual, and context-aware question-answering for research and enterprise use.

- **Value Proposition:**  
  Move beyond vector-only RAG: leverage explicit relationships between concepts, entities, and documents for richer, more explainable answers. Multilingual support and exportable history make it perfect for research, education, and enterprise knowledge management.

---

## 🧠 Conceptual Background

### What is a Knowledge Graph?

A **knowledge graph** is a network of real-world entities (like people, places, or concepts) and their relationships. Imagine a mind map: each node is an entity, each edge a relationship (e.g., "Paper A uses Method B"). Knowledge graphs enable machines to reason about context and connections, not just keywords.

### Retrieval-Augmented Generation (RAG)

RAG systems combine information retrieval (finding relevant facts) with generation (LLMs composing answers). Instead of generating from scratch, the LLM is "grounded" by retrieved data—here, from both vectors *and* the knowledge graph.

### Agents & Tools

- **Agents**: Specialized LLM-powered modules that orchestrate retrieval, entity linking, and answer synthesis.
- **Tools**: Modular components—PDF loaders, entity extractors, graph search, etc.—that agents can call to complete queries.

### PDF-Graph-Based RAG

Instead of treating each PDF as a "bag of words," this system:
1. Splits PDFs into chunks (paragraphs, sections).
2. Extracts entities (methods, datasets, concepts) using NER (Named Entity Recognition).
3. Builds a relational graph: chunks ↔ entities ↔ documents.
4. At query time, retrieves not just similar text, but also related entities & their context.

**This approach provides more explainable, connected answers than plain vector search.**

---

## 🏛️ Architecture

- **Frontend (TypeScript/React/Streamlit)**:  
  - Chat interface for querying the knowledge graph.
  - Graph visualization for exploring nodes/relations.
  - Multilingual UI support.
- **Backend (Python/FastAPI/Neo4j/LLM)**:  
  - PDF ingestion, chunking, and entity extraction.
  - Knowledge graph creation and Cypher querying.
  - Agent and tool orchestration for advanced QA.
  - Secure user management and history storage.
- **Integrations**:
  - **LLMs**: OpenAI, Together AI, or local models (environment-configurable).
  - **Neo4j**: Graph database for entity storage and query.
  - **Vector Store**: For semantic retrieval.
  - **PDF Parsing**: Robust chunking for scientific docs.

**Environment Variables**:  
- `TOGETHER_API_KEY` (LLM access)  
- `OPENAI_API_KEY` (optional)  
- `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD` (graph DB)  
- See `.env.example` for full list.

---

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/DhruvJ2k4/KnowledgeGraph-RAG.git
   cd KnowledgeGraph-RAG
   ```

2. **Setup Python environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Frontend (optional):**
   ```bash
   cd frontend
   npm install
   npm run build
   # or for development
   npm run dev
   ```

4. **Configure environment variables:**
   - Copy `.env.example` to `.env` and set required keys.

---

## ⚡ Usage

- **Launch with Streamlit (for interactive UI):**
  ```bash
  streamlit run frontend/app.py
  ```

- **Upload PDFs:**  
  Use the web interface or API `/upload` endpoint.

- **Build the Knowledge Graph:**  
  Click "Build KG" or use the backend API.

- **Chat/Query Examples:**
  - "Show me all datasets related to BERT."
  - "What methods are used in Document 3, Page 5?"
  - "Find papers connecting 'contrastive learning' and 'graph neural networks'."

- **Export History:**  
  Download chat/query history as **PDF** or **Word** with a single click.

- **Multilingual:**  
  Interface and entity extraction support for English, French, German, and more.

---

## 🌍 Supported Features

- PDF ingestion & chunking
- Named Entity Recognition (NER) on scientific text
- Knowledge graph creation and Cypher querying
- Hybrid retrieval (vector + graph)
- Streamlit and React-based web UI
- Multilingual support
- Downloadable PDF/Word chat history
- User authentication & history
- Dockerized deployment
- LLM-augmented agents and tools

---

## 🧑‍💻 Development Guidelines

- **Branch Strategy:**  
  - `main`: Stable releases.  
  - `dev`: Ongoing development.  
  - Feature branches: `feature/<name>`.
- **Linting:**  
  - Python: `flake8`, `black`.
  - TypeScript: `eslint`, `prettier`.
- **CI/CD:**  
  - GitHub Actions for lint, test, and build.
  - PRs require passing checks before merge.

---

## ✅ Testing & Contributing

- **Backend tests:**
  ```bash
  pytest tests/
  ```
- **Frontend tests:**
  ```bash
  npm test
  ```
- **Coverage:**  
  Reports auto-generated in CI.

**Contributing:**
- Fork, make a feature branch, submit a PR.
- Write clear commit messages and update tests!
- See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 🚀 Deployment

- **Docker (recommended for production):**
  ```bash
  docker-compose up --build
  ```
  Edit `docker-compose.yml` for environment/config overrides.

- **Cloud:**  
  Compatible with AWS ECS, Azure Web Apps, GCP Cloud Run (with proper env vars). Guide coming soon!

---

## 📜 License

Open-source under the [MIT License](LICENSE).

---

## 👤 Authors

- Dhruv J2k4 ([GitHub](https://github.com/DhruvJ2k4))
- [Contributors](https://github.com/DhruvJ2k4/KnowledgeGraph-RAG/graphs/contributors)

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

## 📚 Further Reading

- [FreeCodeCamp: What is a Knowledge Graph?](https://www.freecodecamp.org/news/what-is-a-knowledge-graph/)
- [Neo4j Official Docs](https://neo4j.com/docs/)
- [OpenAI RAG](https://platform.openai.com/docs/guides/retrieval)
- [LangChain Agents](https://python.langchain.com/docs/modules/agents/)

---

## 🎓 Theoretical Explanation (FreeCodeCamp-style)

### Why Knowledge Graphs?

Traditional search finds *matching text*; knowledge graphs let us reason about *meaning* and *relationships*. For example, if two papers use the same method, the graph connects them—even if they use different wording.

### How is RAG Improved by Knowledge Graphs?

- **Vector search**: Finds similar chunks by meaning (semantic similarity).
- **Graph search**: Finds explicit relationships (e.g., "all methods related to diffusion models in 2023 papers").
- **Hybrid**: This project combines both—for answers that are both accurate and explainable.

### What Do Agents and Tools Do?

- **Agents**: Like smart AI assistants, they decide what tools to use to answer your question (entity lookup, document retrieval, etc.).
- **Tools**: Modular functions—PDF loader, entity extractor, Cypher QA, etc.—that do the heavy lifting.

### How does PDF-Graph RAG work?

1. **PDF is chunked** → 2. Entities extracted per chunk → 3. Graph built (nodes: entities/docs, edges: relationships) → 4. At query time, both semantic and graph-based retrieval are used → 5. LLM synthesizes the answer with references and context.

---

## 💡 Environment Variables

| Variable             | Description                  |
|----------------------|-----------------------------|
| `TOGETHER_API_KEY`   | API key for LLM inference   |
| `OPENAI_API_KEY`     | (optional)                  |
| `NEO4J_URI`          | Neo4j database URI          |
| `NEO4J_USERNAME`     | Neo4j username              |
| `NEO4J_PASSWORD`     | Neo4j password              |
| ...                  | See `.env.example`          |

---

## 🔗 Links

- [Issues](https://github.com/DhruvJ2k4/KnowledgeGraph-RAG/issues)
- [Discussions](https://github.com/DhruvJ2k4/KnowledgeGraph-RAG/discussions)

---

*Built with ❤️ by Dhruv and the open-source community.*
