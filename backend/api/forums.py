"""
Channels API - Discord-like chat channels
"""

from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from bson import ObjectId
from db import get_database
from middleware import get_current_user
from middleware.auth_middleware import require_paid_user, get_current_admin_user
from models.forum import ChannelCreate, MessageCreate

router = APIRouter(prefix="/forums", tags=["Channels"])


@router.get("")
async def list_channels(current_user: dict = Depends(require_paid_user)):
    """List all channels"""
    db = get_database()
    cursor = db.forums.find().sort("order", 1)
    channels = []
    async for ch in cursor:
        message_count = await db.channel_messages.count_documents({"channel_id": str(ch["_id"])})
        channels.append({
            "id": str(ch["_id"]),
            "name": ch["name"],
            "slug": ch["slug"],
            "description": ch["description"],
            "is_admin_only": ch.get("is_admin_only", False),
            "message_count": message_count
        })
    return {"forums": channels}


@router.get("/{channel_id}/messages")
async def get_messages(channel_id: str, limit: int = 50, before: str = None, current_user: dict = Depends(require_paid_user)):
    """Get messages in a channel (chronological order, oldest first)"""
    db = get_database()
    
    # Verify channel exists
    channel = await db.forums.find_one({"_id": ObjectId(channel_id)})
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    # Build query
    query = {"channel_id": channel_id}
    if before:
        query["_id"] = {"$lt": ObjectId(before)}
    
    # Get messages (oldest first for chat order)
    cursor = db.channel_messages.find(query).sort("created_at", 1).limit(limit)
    
    messages = []
    async for msg in cursor:
        user = await db.users.find_one({"_id": ObjectId(msg["user_id"])})
        messages.append({
            "id": str(msg["_id"]),
            "channel_id": channel_id,
            "user_id": msg["user_id"],
            "user_email": user["email"].split("@")[0] if user else "Unknown",
            "content": msg["content"],
            "created_at": msg["created_at"],
            "is_admin": user.get("is_admin", False) if user else False
        })
    
    return {"messages": messages, "channel_name": channel["name"], "is_admin_only": channel.get("is_admin_only", False)}


@router.post("/{channel_id}/messages")
async def send_message(channel_id: str, data: MessageCreate, current_user: dict = Depends(require_paid_user)):
    """Send a message to a channel"""
    db = get_database()
    
    # Verify channel exists
    channel = await db.forums.find_one({"_id": ObjectId(channel_id)})
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    # Check admin-only permission
    if channel.get("is_admin_only") and not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Only admins can post in this channel")
    
    # Create message
    message = {
        "channel_id": channel_id,
        "user_id": current_user["id"],
        "content": data.content,
        "created_at": datetime.utcnow()
    }
    result = await db.channel_messages.insert_one(message)
    
    # Get user info for response
    user = await db.users.find_one({"_id": ObjectId(current_user["id"])})
    
    return {
        "message": {
            "id": str(result.inserted_id),
            "channel_id": channel_id,
            "user_id": current_user["id"],
            "user_email": user["email"].split("@")[0] if user else "Unknown",
            "content": data.content,
            "created_at": message["created_at"],
            "is_admin": current_user.get("is_admin", False)
        }
    }


@router.post("")
async def create_channel(data: ChannelCreate, admin: dict = Depends(get_current_admin_user)):
    """Create channel (admin only)"""
    db = get_database()
    channel = data.model_dump()
    channel["created_at"] = datetime.utcnow()
    result = await db.forums.insert_one(channel)
    return {"channel_id": str(result.inserted_id)}

