"""
Leaderboard API
"""

from fastapi import APIRouter, Depends
from db import get_database
from middleware import get_current_user
from middleware.auth_middleware import require_paid_user

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


@router.get("")
async def get_leaderboard(limit: int = 100, current_user: dict = Depends(require_paid_user)):
    """Get leaderboard rankings"""
    db = get_database()
    cursor = db.leaderboard.find().sort("rank", 1).limit(limit)
    
    entries = []
    async for entry in cursor:
        user = await db.users.find_one({"_id": entry["user_id"]}) if isinstance(entry["user_id"], str) else None
        entries.append({
            "rank": entry.get("rank", 0),
            "user_id": str(entry["user_id"]),
            "user_email": user["email"][:3] + "***" if user else "Anonymous",
            "score": entry.get("score", 0),
            "level": entry.get("level", 0),
            "streak_days": entry.get("streak_days", 0),
            "improvement_percentage": entry.get("improvement_percentage", 0)
        })
    
    total = await db.leaderboard.count_documents({})
    return {"entries": entries, "total_users": total}


@router.get("/me")
async def get_my_rank(current_user: dict = Depends(require_paid_user)):
    """Get current user's rank"""
    db = get_database()
    entry = await db.leaderboard.find_one({"user_id": current_user["id"]})
    total = await db.leaderboard.count_documents({})
    
    if not entry:
        return {"rank": None, "total_users": total, "message": "Complete a scan to join"}
    
    return {
        "rank": entry.get("rank", 0),
        "total_users": total,
        "score": entry.get("score", 0),
        "level": entry.get("level", 0),
        "streak_days": entry.get("streak_days", 0),
        "improvement_percentage": entry.get("improvement_percentage", 0)
    }
