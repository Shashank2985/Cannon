"""
Forum Models - Discord-like community features
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ForumCreate(BaseModel):
    """Request to create a new forum channel (admin)"""
    name: str
    slug: str = Field(description="URL-friendly identifier")
    description: str
    is_admin_only: bool = Field(default=False, description="If true, only admins can post")
    icon: Optional[str] = None
    order: int = Field(default=0, description="Display order")


class ForumResponse(BaseModel):
    """Forum channel response"""
    id: str
    name: str
    slug: str
    description: str
    is_admin_only: bool
    icon: Optional[str] = None
    thread_count: int = 0
    last_activity: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class ForumInDB(BaseModel):
    """Full forum model as stored in database"""
    name: str
    slug: str
    description: str
    is_admin_only: bool = False
    icon: Optional[str] = None
    order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ThreadCreate(BaseModel):
    """Request to create a new thread"""
    forum_id: str
    title: str
    content: str


class ThreadResponse(BaseModel):
    """Thread response for API"""
    id: str
    forum_id: str
    forum_name: Optional[str] = None
    user_id: str
    user_email: Optional[str] = None
    title: str
    content: str
    created_at: datetime
    updated_at: datetime
    reply_count: int = 0
    is_pinned: bool = False
    is_locked: bool = False
    
    class Config:
        from_attributes = True


class ThreadInDB(BaseModel):
    """Full thread model as stored in database"""
    forum_id: str
    user_id: str
    title: str
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    reply_count: int = 0
    is_pinned: bool = False
    is_locked: bool = False


class ReplyCreate(BaseModel):
    """Request to create a reply"""
    thread_id: str
    content: str
    parent_reply_id: Optional[str] = Field(default=None, description="For nested replies")


class ReplyResponse(BaseModel):
    """Reply response for API"""
    id: str
    thread_id: str
    user_id: str
    user_email: Optional[str] = None
    content: str
    created_at: datetime
    updated_at: datetime
    parent_reply_id: Optional[str] = None
    is_deleted: bool = False
    
    class Config:
        from_attributes = True


class ReplyInDB(BaseModel):
    """Full reply model as stored in database"""
    thread_id: str
    user_id: str
    content: str
    parent_reply_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_deleted: bool = False


class ThreadWithReplies(BaseModel):
    """Thread with its replies"""
    thread: ThreadResponse
    replies: List[ReplyResponse] = Field(default_factory=list)
