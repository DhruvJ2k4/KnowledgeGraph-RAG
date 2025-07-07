from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON, DateTime, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql.expression import text
from sqlalchemy.sql.sqltypes import TIMESTAMP
from sqlalchemy.sql import func

from .base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    fullname = Column(String, nullable=False)  # Ensure fullname is required
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    is_superuser = Column(Boolean, nullable=False, default=False)
    created_at = Column(TIMESTAMP, server_default=text("now()"))
    last_convo = Column(TIMESTAMP, server_default=text("now()"))
    chat_history = Column(JSON, nullable=True)

    # Relationships
    files = relationship("File", back_populates="user")
    query_history = relationship("QueryHistory", back_populates="user")

class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    size = Column(Integer, nullable=False, default=0)
    status = Column(String, nullable=False, default="pending")
    uploaded_at = Column(TIMESTAMP, server_default=text("now()"))
    processed_at = Column(TIMESTAMP, nullable=True)
    file_path = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    user = relationship("User", back_populates="files")

class QueryHistory(Base):
    __tablename__ = "query_history"

    id = Column(Integer, primary_key=True, index=True)
    query = Column(Text)
    answer = Column(Text)
    timestamp = Column(TIMESTAMP, server_default=text("now()"))
    response = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    user = relationship("User", back_populates="query_history")

class SystemLog(Base):
    __tablename__ = "system_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(TIMESTAMP, server_default=text("now()"))
    level = Column(String, nullable=False)
    message = Column(String, nullable=False)
    details = Column(JSON, nullable=True)
