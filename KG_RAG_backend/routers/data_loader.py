from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from typing import List
from pathlib import Path
from modules.data_loader import PDFLoader
from auth.oauth2 import get_current_user
from db import models
from sqlalchemy.orm import Session
import os
from datetime import datetime

from db.database import get_db
from schemas import FileStatus

router = APIRouter(
    prefix="/data-loader",
    tags=["data-loader"],
    responses={
        400: {"description": "Bad Request"},
        401: {"description": "Unauthorized"},
        500: {"description": "Internal Server Error"},
    }
)

@router.post("/upload")
async def upload_files(
    files: List[UploadFile] = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Create user-specific directory
        user_dir = Path(f"data/pdfs/{current_user.username}")
        user_dir.mkdir(parents=True, exist_ok=True)
        
        uploaded_db_files = [] # Store db_file objects to update their status later
        for file in files:
            if not file.filename.lower().endswith('.pdf'):
                raise HTTPException(
                    status_code=400,
                    detail=f"File {file.filename} is not a PDF"
                )
            
            # Save file to user's directory
            file_path = user_dir / file.filename
            # Read content to get size before writing
            content = await file.read()
            file_size = len(content) # Get size in bytes
            with open(file_path, "wb") as buffer:
                buffer.write(content)
            
            # Create file record in database
            db_file = models.File(
                filename=file.filename,
                size=file_size, # Save the actual file size
                status="pending",
                file_path=str(file_path),
                user_id=current_user.id
            )
            db.add(db_file)
            db.commit()
            db.refresh(db_file)
            
            uploaded_db_files.append(db_file)

        # Process the uploaded PDFs (chunking)
        loader = PDFLoader(
            pdf_dir=str(user_dir),
            username=current_user.username
        )
        await loader.load_pdfs()
        
        # Update status of processed files in the database
        for db_file in uploaded_db_files:
            db_file.status = "processed" # Mark as processed after PDF loading
            db.add(db_file)
        db.commit()

        return JSONResponse(
            content={
                "message": "Files uploaded and processed successfully",
                "files": [{
                    "filename": f.filename,
                    "status": "success"
                } for f in uploaded_db_files] # Return success status for each file
            },
            status_code=200
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing files: {str(e)}"
        )

@router.get("/list", response_model=List[FileStatus])
async def list_files(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Get list of uploaded files
        files = db.query(models.File).filter(models.File.user_id == current_user.id).all()
        return files
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving files: {str(e)}"
        )

@router.delete("/delete/{file_id}")
async def delete_file(
    file_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file = db.query(models.File).filter(
        models.File.id == file_id,
        models.File.user_id == current_user.id
    ).first()
    
    if not file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    
    # Delete file from storage
    if os.path.exists(file.file_path):
        os.remove(file.file_path)
    
    # Delete from database
    db.delete(file)
    db.commit()
    
    return {"message": "File deleted successfully"}

@router.get("/status/{file_id}", response_model=FileStatus)
async def get_file_status(
    file_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file = db.query(models.File).filter(
        models.File.id == file_id,
        models.File.user_id == current_user.id
    ).first()
    
    if not file:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    
    return file
