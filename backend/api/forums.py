"""
Forums API - Discord-like channels
"""

from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from bson import ObjectId
from db import get_database
from middleware import get_current_user
from middleware.auth_middleware import require_paid_user, get_current_admin_user
from models.forum import ForumCreate, ThreadCreate, ReplyCreate

router = APIRouter(prefix="/forums", tags=["Forums"])


@router.get("")
async def list_forums(current_user: dict = Depends(require_paid_user)):
    """List all forum channels"""
    db = get_database()
    cursor = db.forums.find().sort("order", 1)
    forums = []
    async for f in cursor:
        thread_count = await db.forum_threads.count_documents({"forum_id": str(f["_id"])})
        forums.append({"id": str(f["_id"]), "name": f["name"], "slug": f["slug"], "description": f["description"], "is_admin_only": f.get("is_admin_only", False), "thread_count": thread_count})
    return {"forums": forums}


@router.get("/{forum_id}/threads")
async def list_threads(forum_id: str, page: int = 1, limit: int = 20, current_user: dict = Depends(require_paid_user)):
    """List threads in a channel"""
    db = get_database()
    skip = (page - 1) * limit
    cursor = db.forum_threads.find({"forum_id": forum_id}).sort([("is_pinned", -1), ("created_at", -1)]).skip(skip).limit(limit)
    threads = []
    async for t in cursor:
        user = await db.users.find_one({"_id": ObjectId(t["user_id"])})
        threads.append({"id": str(t["_id"]), "title": t["title"], "user_email": user["email"] if user else "Unknown", "created_at": t["created_at"], "reply_count": t.get("reply_count", 0), "is_pinned": t.get("is_pinned", False)})
    return {"threads": threads}


@router.post("/{forum_id}/threads")
async def create_thread(forum_id: str, data: ThreadCreate, current_user: dict = Depends(require_paid_user)):
    """Create new thread"""
    db = get_database()
    forum = await db.forums.find_one({"_id": ObjectId(forum_id)})
    if not forum:
        raise HTTPException(status_code=404, detail="Forum not found")
    if forum.get("is_admin_only") and not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only channel")
    
    thread = {"forum_id": forum_id, "user_id": current_user["id"], "title": data.title, "content": data.content, "created_at": datetime.utcnow(), "updated_at": datetime.utcnow(), "reply_count": 0}
    result = await db.forum_threads.insert_one(thread)
    return {"thread_id": str(result.inserted_id)}


@router.get("/threads/{thread_id}")
async def get_thread(thread_id: str, current_user: dict = Depends(require_paid_user)):
    """Get thread with replies"""
    db = get_database()
    thread = await db.forum_threads.find_one({"_id": ObjectId(thread_id)})
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    cursor = db.forum_replies.find({"thread_id": thread_id}).sort("created_at", 1)
    replies = []
    async for r in cursor:
        user = await db.users.find_one({"_id": ObjectId(r["user_id"])})
        replies.append({"id": str(r["_id"]), "content": r["content"], "user_email": user["email"] if user else "Unknown", "created_at": r["created_at"]})
    
    return {"thread": {"id": str(thread["_id"]), "title": thread["title"], "content": thread["content"]}, "replies": replies}


@router.post("/threads/{thread_id}/reply")
async def add_reply(thread_id: str, data: ReplyCreate, current_user: dict = Depends(require_paid_user)):
    """Add reply to thread"""
    db = get_database()
    thread = await db.forum_threads.find_one({"_id": ObjectId(thread_id)})
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    reply = {"thread_id": thread_id, "user_id": current_user["id"], "content": data.content, "created_at": datetime.utcnow()}
    await db.forum_replies.insert_one(reply)
    await db.forum_threads.update_one({"_id": ObjectId(thread_id)}, {"$inc": {"reply_count": 1}})
    return {"message": "Reply added"}


@router.post("")
async def create_forum(data: ForumCreate, admin: dict = Depends(get_current_admin_user)):
    """Create forum (admin only)"""
    db = get_database()
    forum = data.model_dump()
    forum["created_at"] = datetime.utcnow()
    result = await db.forums.insert_one(forum)
    return {"forum_id": str(result.inserted_id)}
