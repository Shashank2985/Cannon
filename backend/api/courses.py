"""
Courses API
"""

from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from bson import ObjectId
from db import get_database
from middleware import get_current_user
from middleware.auth_middleware import require_paid_user, get_current_admin_user
from models.course import CourseCreate, CourseResponse, TaskCompletionRequest

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.get("")
async def list_courses(current_user: dict = Depends(require_paid_user)):
    """List all active courses"""
    db = get_database()
    cursor = db.courses.find({"is_active": True})
    courses = []
    async for c in cursor:
        c["id"] = str(c["_id"])
        del c["_id"]
        courses.append(c)
    return {"courses": courses}


@router.get("/{course_id}")
async def get_course(course_id: str, current_user: dict = Depends(require_paid_user)):
    """Get course details"""
    db = get_database()
    course = await db.courses.find_one({"_id": ObjectId(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    course["id"] = str(course["_id"])
    return course


@router.post("/{course_id}/start")
async def start_course(course_id: str, current_user: dict = Depends(require_paid_user)):
    """Start a course"""
    db = get_database()
    course = await db.courses.find_one({"_id": ObjectId(course_id)})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    existing = await db.user_course_progress.find_one({"user_id": current_user["id"], "course_id": course_id})
    if existing:
        return {"message": "Already enrolled", "progress_id": str(existing["_id"])}
    
    progress = {
        "user_id": current_user["id"],
        "course_id": course_id,
        "current_stage": 1,
        "completed_tasks": [],
        "progress_percentage": 0.0,
        "started_at": datetime.utcnow(),
        "last_activity": datetime.utcnow()
    }
    result = await db.user_course_progress.insert_one(progress)
    return {"message": "Course started", "progress_id": str(result.inserted_id)}


@router.put("/{course_id}/complete-task")
async def complete_task(course_id: str, data: TaskCompletionRequest, current_user: dict = Depends(require_paid_user)):
    """Mark task as complete"""
    db = get_database()
    progress = await db.user_course_progress.find_one({"user_id": current_user["id"], "course_id": course_id})
    if not progress:
        raise HTTPException(status_code=404, detail="Not enrolled in course")
    
    completed = progress.get("completed_tasks", [])
    if data.task_id not in completed:
        completed.append(data.task_id)
    
    course = await db.courses.find_one({"_id": ObjectId(course_id)})
    total_tasks = sum(len(s.get("tasks", [])) for s in course.get("stages", []))
    percentage = (len(completed) / total_tasks * 100) if total_tasks > 0 else 0
    
    await db.user_course_progress.update_one(
        {"_id": progress["_id"]},
        {"$set": {"completed_tasks": completed, "progress_percentage": percentage, "last_activity": datetime.utcnow()}}
    )
    return {"progress_percentage": percentage}


@router.get("/progress/current")
async def get_current_progress(current_user: dict = Depends(require_paid_user)):
    """Get user's course progress"""
    db = get_database()
    cursor = db.user_course_progress.find({"user_id": current_user["id"]})
    progress = [{"id": str(p["_id"]), "course_id": p["course_id"], "progress_percentage": p["progress_percentage"]} async for p in cursor]
    return {"progress": progress}


@router.post("")
async def create_course(data: CourseCreate, admin: dict = Depends(get_current_admin_user)):
    """Create course (admin only)"""
    db = get_database()
    course = data.model_dump()
    course["created_at"] = datetime.utcnow()
    course["updated_at"] = datetime.utcnow()
    course["is_active"] = True
    result = await db.courses.insert_one(course)
    return {"course_id": str(result.inserted_id)}
