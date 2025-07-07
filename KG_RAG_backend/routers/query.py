from fastapi import APIRouter, Depends, status, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
import logging

from db.database import get_db
from db import models
from auth.oauth2 import get_current_user
from schemas import QuestionRequest, AnswerResponse, QueryHistory
from modules.agent import SearchAgent

router = APIRouter(
    prefix="/query",
    tags=["query"],
    responses={
        400: {"description": "Bad Request"},
        401: {"description": "Unauthorized"},
        500: {"description": "Internal Server Error"},
    }
)

@router.post("/chat", response_model=AnswerResponse)
async def chat(
    request: QuestionRequest = Body(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Answers a question based on the ingested PDFs."""
    try:
        logging.info(f"Received chat request: {request.model_dump_json()}")
        # Initialize agent with user's username
        agent = SearchAgent(username=current_user.username)
        
        # Get answer using search method
        answer = agent.search(request.question)
        
        try:
            # Save query to history
            history_entry = models.QueryHistory(
                user_id=current_user.id,
                query=request.question,
                answer=answer,
                timestamp=datetime.now()
            )
            db.add(history_entry)
            db.commit()
        except Exception as e:
            # Log the error but continue with the response
            print(f"Error saving query history: {str(e)}")
        
        return AnswerResponse(answer=answer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing query: {str(e)}"
        )

@router.get("/history", response_model=List[QueryHistory])
async def get_query_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 10
):
    """Get user's query history."""
    history = db.query(models.QueryHistory).filter(
        models.QueryHistory.user_id == current_user.id
    ).order_by(models.QueryHistory.timestamp.desc()).limit(limit).all()
    
    return history
