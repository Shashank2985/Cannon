"""
Course Models - Structured improvement courses
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class CourseCategory(str, Enum):
    """Course category types"""
    JAWLINE = "jawline"
    SKIN = "skin"
    FAT_LOSS = "fat_loss"
    POSTURE = "posture"
    MEWING = "mewing"
    SKINCARE = "skincare"
    HAIR = "hair"
    MINDSET = "mindset"


class CourseTask(BaseModel):
    """Individual task within a course stage"""
    task_id: str
    title: str
    description: str
    duration_minutes: int = Field(default=10, ge=1)
    video_url: Optional[str] = None
    instructions: List[str] = Field(default_factory=list)
    tips: List[str] = Field(default_factory=list)


class CourseStage(BaseModel):
    """Stage within a course"""
    stage_number: int = Field(ge=1)
    title: str
    description: str
    tasks: List[CourseTask] = Field(default_factory=list)
    unlock_after_days: int = Field(default=0, description="Days from start to unlock")


class CourseCreate(BaseModel):
    """Request to create a new course (admin)"""
    title: str
    description: str
    category: CourseCategory
    thumbnail_url: Optional[str] = None
    difficulty: str = Field(default="beginner")
    estimated_weeks: int = Field(default=4, ge=1)
    stages: List[CourseStage] = Field(default_factory=list)


class CourseResponse(BaseModel):
    """Course response for API"""
    id: str
    title: str
    description: str
    category: CourseCategory
    thumbnail_url: Optional[str] = None
    difficulty: str
    estimated_weeks: int
    stages: List[CourseStage] = Field(default_factory=list)
    total_tasks: int = 0
    is_active: bool = True
    created_at: datetime
    
    class Config:
        from_attributes = True


class CourseInDB(BaseModel):
    """Full course model as stored in database"""
    title: str
    description: str
    category: CourseCategory
    thumbnail_url: Optional[str] = None
    difficulty: str = "beginner"
    estimated_weeks: int = 4
    stages: List[CourseStage] = Field(default_factory=list)
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CourseProgress(BaseModel):
    """User's progress in a course"""
    id: str
    user_id: str
    course_id: str
    course_title: str
    current_stage: int = 1
    completed_tasks: List[str] = Field(default_factory=list)
    progress_percentage: float = Field(default=0.0, ge=0, le=100)
    started_at: datetime
    last_activity: datetime
    is_completed: bool = False
    
    class Config:
        from_attributes = True


class CourseProgressInDB(BaseModel):
    """Full progress model as stored in database"""
    user_id: str
    course_id: str
    current_stage: int = 1
    completed_tasks: List[str] = Field(default_factory=list)
    progress_percentage: float = 0.0
    started_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: datetime = Field(default_factory=datetime.utcnow)
    is_completed: bool = False


class TaskCompletionRequest(BaseModel):
    """Request to mark a task as complete"""
    task_id: str
    stage_number: int
