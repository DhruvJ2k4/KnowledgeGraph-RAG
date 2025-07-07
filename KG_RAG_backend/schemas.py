from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from pydantic.types import conint

class ORMBase(BaseModel):
    """ Base for ORM models"""

    class Config:
        from_attributes = True

class UserOut(ORMBase):
    id: int
    fullname: str
    username: str
    is_active: bool
    is_superuser: bool
    created_at: datetime
    last_convo: datetime
    chat_history: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    fullname: str

class UserCreate(UserBase):
    password: str
    is_superuser: bool = False

class UserUpdate(BaseModel):
    fullname: Optional[str] = None
    username: Optional[str] = None

class PDFUploadRequest(BaseModel):
    filename: str

class PDFUploadResponse(BaseModel):
    file_id: str
    filename: str
    status: str

class QuestionRequest(BaseModel):
    question: str

class AnswerResponse(BaseModel):
    answer: str

class GraphDataNode(BaseModel):
    entity: str
    chunk_id: List[str]

class GraphDataEdge(BaseModel):
    source: str
    target: str
    relation: str = "MENTIONS"

class GraphData(BaseModel):
    nodes: List[GraphDataNode]
    edges: List[GraphDataEdge]

class ErrorResponse(BaseModel):
    detail: str

class TokenData(BaseModel):
    id: Optional[int] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class FileStatus(BaseModel):
    id: int
    filename: str
    size: int
    status: str
    uploaded_at: datetime
    processed_at: Optional[datetime] = None
    file_path: str
    user_id: int

    class Config:
        from_attributes = True

class GraphSearch(BaseModel):
    query: str
    filters: Optional[Dict[str, Any]] = None
    limit: int = 10

class GraphStats(BaseModel):
    node_count: int
    relationship_count: int
    entity_types: List[str]
    relationship_types: List[str]

class QueryHistory(BaseModel):
    id: int
    query: str
    timestamp: datetime
    user_id: int
    response: Optional[str] = None
    answer: str

    class Config:
        from_attributes = True

class KGStatusResponse(BaseModel):
    status: str # e.g., 'offline', 'building', 'ready', 'error'
    message: Optional[str] = None
    stage: Optional[str] = None # For 'building' status, e.g., 'Processing PDFs...'
    progress: Optional[int] = None # For 'building' status, 0-100
    pdfsProcessed: Optional[int] = None
    chunksCreated: Optional[int] = None
    entitiesExtracted: Optional[int] = None
    relationshipsCreated: Optional[int] = None
    entityCount: Optional[int] = None
    relationshipCount: Optional[int] = None