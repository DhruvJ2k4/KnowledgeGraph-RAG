import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import KG_status, query, graph, data_loader, auth, user
from config import settings
from db.neo4j_connector import Neo4jConnector
import socket
import sys

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        neo4j_connector.connect()
        if neo4j_connector.verify_connection():
            print("Successfully connected to Neo4j.")
        else:
            print("Failed to connect to Neo4j. Continuing without Neo4j connection.")
    except Exception as e:
        print(f"Error during Neo4j startup: {e}")
        print("Continuing without Neo4j connection.")
    
    yield
    
    # Shutdown
    try:
        neo4j_connector.close()
    except Exception as e:
        print(f"Error during Neo4j shutdown: {e}")

app = FastAPI(lifespan=lifespan)

# CORS configuration
origins = [
    "http://localhost:3000",  # Allow requests from the frontend
    "http://localhost:8000",  # Allow requests from the backend itself
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(KG_status.router, tags=["KG-status"])
app.include_router(query.router, tags=["query"])
app.include_router(graph.router, tags=["graph"])
app.include_router(data_loader.router, tags=["data-loader"])
app.include_router(auth.router, tags=["auth"])
app.include_router(user.router, tags=["users"])

# Initialize Neo4j connector
neo4j_connector = Neo4jConnector()

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    try:
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    except OSError as e:
        if e.errno == 10048:  # Port already in use
            print("Port 8000 is already in use. Please try a different port or stop the existing process.")
            sys.exit(1)
        else:
            raise