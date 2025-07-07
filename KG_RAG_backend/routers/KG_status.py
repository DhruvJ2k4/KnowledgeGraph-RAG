from fastapi import APIRouter, HTTPException, Depends, status
from modules.data_loader import PDFLoader
from modules.JSON_NER import Chunks_NER
from modules.KnowledgeGraph import KnowledgeGraph
from auth.oauth2 import get_current_user
from db import models
from typing import List, Dict, Any
from pathlib import Path
from sqlalchemy.orm import Session
import logging
import psutil
import os
from datetime import datetime
import shutil
from config import settings
from schemas import KGStatusResponse

from db.database import get_db

router = APIRouter(
    prefix="/KG-status",
    tags=["KG-status"],
    responses={
        400: {"description": "Bad Request"},
        401: {"description": "Unauthorized"},
        404: {"description": "Not Found"},
        500: {"description": "Internal Server Error"},
    }
)

@router.get("/status", response_model=KGStatusResponse)
async def get_kg_status(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get the current status of the knowledge graph for the user."""
    try:
        # Check files status
        files = db.query(models.File).filter(models.File.user_id == current_user.id).all()

        pdfs_processed = sum(1 for f in files if f.status in ["processed", "entities_extracted", "graph_built", "graph_updated"])
        entities_extracted = sum(1 for f in files if f.status in ["entities_extracted", "graph_built", "graph_updated"])
        graph_built = any(f.status in ["graph_built", "graph_updated"] for f in files)

        logging.info(f"KG Status - User: {current_user.username}")
        logging.info(f"  PDFs Processed: {pdfs_processed}")
        logging.info(f"  Entities Extracted: {entities_extracted}")
        logging.info(f"  Graph Built: {graph_built}")

        status_message = "offline"
        if graph_built:
            status_message = "ready"
        elif entities_extracted > 0:
            status_message = "entities_extracted" # Custom status for FE
        elif pdfs_processed > 0:
            status_message = "processed" # Custom status for FE
        
        logging.info(f"  Determined status: {status_message}")

        # Get graph stats from Neo4j
        entity_count = 0
        relationship_count = 0
        if status_message == "ready":
            try:
                kg = KnowledgeGraph(username=current_user.username)
                stats = kg.get_graph_stats()
                entity_count = stats["node_count"]
                relationship_count = stats["relationship_count"]
                kg.close()
            except Exception as e:
                logging.warning(f"Could not connect to Neo4j or get graph stats: {e}")
                # If Neo4j is not ready but files are processed, still show processed status
                if status_message == "ready":
                    status_message = "error"
                    return KGStatusResponse(
                        status=status_message,
                        message="Knowledge graph not accessible. Please ensure Neo4j is running."
                    )

        return KGStatusResponse(
            status=status_message,
            message="Knowledge Graph is ready for queries" if status_message == "ready" else "",
            pdfsProcessed=pdfs_processed,
            entitiesExtracted=entities_extracted,
            entityCount=entity_count,
            relationshipCount=relationship_count
        )

    except Exception as e:
        logging.error(f"Error getting KG status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving knowledge graph status: {str(e)}"
        )

@router.post("/pdf-status")
async def pdf_breaker(file_ids: List[str], current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        # Get user's files from database
        files = db.query(models.File).filter(
            models.File.user_id == current_user.id,
            models.File.status == "pending"
        ).all()
        
        if not files:
            raise HTTPException(status_code=404, detail="No pending PDFs found for user")
            
        user_dir = Path(f"data/pdfs/{current_user.username}")
        if not user_dir.exists():
            raise HTTPException(status_code=404, detail="PDF directory not found")
            
        loader = PDFLoader(pdf_dir=str(user_dir), username=current_user.username)
        await loader.load_pdfs()
        
        # Update file status to processed
        for file in files:
            file.status = "processed"
            file.processed_at = datetime.now()
        db.commit()
        
        return {
            "message": "PDFs processed successfully", 
            "status": "completed",
            "files_processed": len(files)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/entity-extractor")
async def entity_extractor(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Extract entities from chunks and create knowledge graph."""
    try:
        # Check if chunks exist for the user
        chunks_file = Path(f"data/chunks/{current_user.username}/chunks_{current_user.username}.jsonl")
        if not chunks_file.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No chunks found for processing. Please process PDFs first."
            )
            
        # Initialize NER with username
        ner = Chunks_NER(username=current_user.username)
        
        # Extract entities
        entities = ner.Extract_Entities()
        
        # Update file status in database
        files = db.query(models.File).filter(
            models.File.user_id == current_user.id,
            models.File.status == "processed"
        ).all()
        
        for file in files:
            file.status = "entities_extracted"
        db.commit()
        
        return {
            "message": "Entity extraction completed successfully",
            "status": "completed",
            "files_processed": len(files),
            "entities_found": len(entities) if entities else 0
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error in entity extraction: {str(e)}"
        )

@router.post("/build-kg")
async def build_knowledge_graph(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Build knowledge graph from extracted entities."""
    try:
        # Check if entities exist for the user
        entities_file = Path(f"data/entities/{current_user.username}/entities_{current_user.username}.json")
        if not entities_file.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No entities found for processing. Please extract entities first."
            )
            
        # Initialize KnowledgeGraph with user-specific path
        kg = KnowledgeGraph(username=current_user.username)
        
        # Create the knowledge graph
        kg.create_graph()
        kg.close()
        
        # Update file status in database
        files = db.query(models.File).filter(
            models.File.user_id == current_user.id,
            models.File.status == "entities_extracted"
        ).all()
        
        for file in files:
            file.status = "graph_built"
        db.commit()
        
        return {
            "message": "Knowledge graph built successfully",
            "status": "completed",
            "files_processed": len(files)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error building knowledge graph: {str(e)}"
        )

@router.post("/update-kg")
async def update_knowledge_graph(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update knowledge graph with new entities."""
    try:
        # First extract new entities
        ner = Chunks_NER(username=current_user.username)
        entities = ner.Extract_Entities()
        
        # Then update the knowledge graph
        kg = KnowledgeGraph(username=current_user.username)
        kg.create_graph()
        kg.close()
        
        # Update file status in database
        files = db.query(models.File).filter(
            models.File.user_id == current_user.id,
            models.File.status == "processed"
        ).all()
        
        for file in files:
            file.status = "graph_updated"
        db.commit()
        
        return {
            "message": "Knowledge graph updated successfully",
            "status": "completed",
            "files_processed": len(files),
            "entities_found": len(entities) if entities else 0
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating knowledge graph: {str(e)}"
        )

@router.delete("/pdf-status", status_code=status.HTTP_204_NO_CONTENT)
def delete_pdf_status(current_user: models.User = Depends(get_current_user)):
    """Delete all PDF files and their status for the current user."""
    try:
        # Delete PDF files
        pdf_dir = Path(f"data/pdfs/{current_user.username}")
        if pdf_dir.exists():
            shutil.rmtree(pdf_dir)
            pdf_dir.mkdir(parents=True, exist_ok=True)
        
        # Delete file records from database
        db = next(get_db())
        db.query(models.File).filter(models.File.user_id == current_user.id).delete()
        db.commit()
        
        return {"message": "Successfully deleted all PDF files and their status"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting PDF status: {str(e)}"
        )

@router.delete("/entity-extractor", status_code=status.HTTP_204_NO_CONTENT)
def delete_entity_extractor(current_user: models.User = Depends(get_current_user)):
    """Delete all entity extraction results for the current user."""
    try:
        # Delete entity files
        entity_dir = Path(f"data/entities/{current_user.username}")
        if entity_dir.exists():
            shutil.rmtree(entity_dir)
            entity_dir.mkdir(parents=True, exist_ok=True)
        
        # Delete chunks file
        chunks_file = Path(f"data/chunks/{current_user.username}/chunks.json")
        if chunks_file.exists():
            chunks_file.unlink()
            chunks_file.parent.mkdir(parents=True, exist_ok=True)
        
        return {"message": "Successfully deleted all entity extraction results"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting entity extraction results: {str(e)}"
        )

@router.delete("/knowledge-graph", status_code=status.HTTP_204_NO_CONTENT)
def delete_knowledge_graph(current_user: models.User = Depends(get_current_user)):
    """Delete the knowledge graph for the current user."""
    try:
        # Delete knowledge graph from Neo4j
        kg = KnowledgeGraph()
        kg.delete_graph()
        kg.close()
        
        # Delete graph files
        graph_dir = Path(f"data/graphs/{current_user.username}")
        if graph_dir.exists():
            shutil.rmtree(graph_dir)
            graph_dir.mkdir(parents=True, exist_ok=True)
        
        return {"message": "Successfully deleted knowledge graph"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting knowledge graph: {str(e)}"
        )