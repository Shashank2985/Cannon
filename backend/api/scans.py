"""
Face Scans API
"""

from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from datetime import datetime
from bson import ObjectId
from db import get_database
from middleware import get_current_user
from middleware.auth_middleware import require_paid_user
from services.storage_service import storage_service
from agents.face_scan_agent import face_scan_agent

router = APIRouter(prefix="/scans", tags=["Face Scans"])


@router.post("/upload")
async def upload_scan_images(
    front: UploadFile = File(...),
    left: UploadFile = File(...),
    right: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload 3 face scan images"""
    db = get_database()
    user_id = current_user["id"]
    
    front_data = await front.read()
    left_data = await left.read()
    right_data = await right.read()
    
    front_url = await storage_service.upload_image(front_data, user_id, "front")
    left_url = await storage_service.upload_image(left_data, user_id, "left")
    right_url = await storage_service.upload_image(right_data, user_id, "right")
    
    if not all([front_url, left_url, right_url]):
        raise HTTPException(status_code=500, detail="Failed to upload images")
    
    scan_doc = {
        "user_id": user_id,
        "created_at": datetime.utcnow(),
        "images": {"front": front_url, "left": left_url, "right": right_url},
        "is_unlocked": current_user.get("is_paid", False),
        "processing_status": "pending"
    }
    
    result = await db.scans.insert_one(scan_doc)
    scan_id = str(result.inserted_id)
    
    if not current_user.get("first_scan_completed", False):
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"first_scan_completed": True}}
        )
    
    return {"scan_id": scan_id, "images": scan_doc["images"]}


@router.post("/{scan_id}/analyze")
async def analyze_scan(scan_id: str, current_user: dict = Depends(get_current_user)):
    """Trigger AI analysis for uploaded scan"""
    db = get_database()
    
    scan = await db.scans.find_one({"_id": ObjectId(scan_id), "user_id": current_user["id"]})
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    await db.scans.update_one({"_id": ObjectId(scan_id)}, {"$set": {"processing_status": "processing"}})
    
    try:
        # Get image data - handle both local and S3 storage
        front_url = scan["images"]["front"]
        left_url = scan["images"]["left"]
        right_url = scan["images"]["right"]
        
        if front_url.startswith("/uploads/"):
            # Local storage - read files directly
            front_data = await storage_service.get_image(front_url)
            left_data = await storage_service.get_image(left_url)
            right_data = await storage_service.get_image(right_url)
        else:
            # S3 storage - fetch via HTTP
            import httpx
            async with httpx.AsyncClient() as client:
                front_resp = await client.get(front_url)
                left_resp = await client.get(left_url)
                right_resp = await client.get(right_url)
            front_data = front_resp.content
            left_data = left_resp.content
            right_data = right_resp.content
        
        if not all([front_data, left_data, right_data]):
            raise HTTPException(status_code=500, detail="Failed to retrieve images")
        
        analysis = await face_scan_agent.analyze(front_data, left_data, right_data)
        
        await db.scans.update_one(
            {"_id": ObjectId(scan_id)},
            {"$set": {"analysis": analysis.model_dump(), "processing_status": "completed"}}
        )
        
        # Update leaderboard entry for this user
        user_id = current_user["id"]
        overall_score = analysis.overall_score if hasattr(analysis, 'overall_score') else analysis.metrics.overall_score if hasattr(analysis, 'metrics') else 0
        
        # Get all completed scans for this user to calculate improvement
        scan_cursor = db.scans.find({
            "user_id": user_id,
            "processing_status": "completed",
            "analysis": {"$exists": True}
        }).sort("created_at", -1)
        
        user_scans = []
        async for s in scan_cursor:
            score = s.get("analysis", {}).get("overall_score") or s.get("analysis", {}).get("metrics", {}).get("overall_score", 0)
            user_scans.append({"score": score, "created_at": s.get("created_at")})
        
        # Calculate improvement percentage (compare first to latest)
        improvement_percentage = 0
        if len(user_scans) >= 2:
            first_score = user_scans[-1]["score"] or 0
            latest_score = user_scans[0]["score"] or 0
            if first_score > 0:
                improvement_percentage = ((latest_score - first_score) / first_score) * 100
        
        # Calculate score for leaderboard (based on overall_score * multiplier)
        leaderboard_score = (float(overall_score) if overall_score else 0) * 10  # Scale to 100
        
        # Update or create leaderboard entry
        existing_entry = await db.leaderboard.find_one({"user_id": user_id})
        
        if existing_entry:
            # Update with new score if higher
            new_score = max(existing_entry.get("score", 0), leaderboard_score)
            await db.leaderboard.update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        "score": new_score,
                        "level": float(overall_score) if overall_score else 0,
                        "improvement_percentage": improvement_percentage,
                        "last_scan_at": datetime.utcnow()
                    },
                    "$inc": {"scans_count": 1}
                }
            )
        else:
            # Create new entry
            await db.leaderboard.insert_one({
                "user_id": user_id,
                "score": leaderboard_score,
                "level": float(overall_score) if overall_score else 0,
                "streak_days": 1,
                "improvement_percentage": 0,
                "scans_count": 1,
                "last_scan_at": datetime.utcnow(),
                "created_at": datetime.utcnow()
            })
        
        # Recalculate ranks for all leaderboard entries
        all_entries = await db.leaderboard.find().sort("score", -1).to_list(None)
        for rank, entry in enumerate(all_entries, 1):
            await db.leaderboard.update_one({"_id": entry["_id"]}, {"$set": {"rank": rank}})
        
        return {"message": "Analysis complete", "scan_id": scan_id}
    except Exception as e:
        await db.scans.update_one({"_id": ObjectId(scan_id)}, {"$set": {"processing_status": "failed", "error_message": str(e)}})
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")


@router.get("/latest")
async def get_latest_scan(current_user: dict = Depends(get_current_user)):
    """Get most recent scan"""
    db = get_database()
    scan = await db.scans.find_one({"user_id": current_user["id"]}, sort=[("created_at", -1)])
    if not scan:
        raise HTTPException(status_code=404, detail="No scans found")
    
    is_paid = current_user.get("is_paid", False)
    response = {
        "id": str(scan["_id"]),
        "created_at": scan["created_at"],
        "images": scan.get("images", {}),
        "is_unlocked": is_paid,
        "processing_status": scan.get("processing_status")
    }
    
    if scan.get("analysis"):
        if is_paid:
            response["analysis"] = scan["analysis"]
        else:
            # For unpaid users, only show overall score
            overall_score = scan["analysis"].get("overall_score") or scan["analysis"].get("metrics", {}).get("overall_score")
            response["analysis"] = {"overall_score": overall_score, "locked": True}
    
    return response


@router.get("/history")
async def get_scan_history(limit: int = 10, current_user: dict = Depends(require_paid_user)):
    """Get scan history (paid only)"""
    db = get_database()
    cursor = db.scans.find({"user_id": current_user["id"]}).sort("created_at", -1).limit(limit)
    scans = [{"id": str(s["_id"]), "created_at": s["created_at"], "overall_score": s.get("analysis", {}).get("metrics", {}).get("overall_score")} async for s in cursor]
    return {"scans": scans}


@router.get("/{scan_id}")
async def get_scan_by_id(scan_id: str, current_user: dict = Depends(require_paid_user)):
    """Get a specific scan with full analysis (paid only)"""
    db = get_database()
    
    scan = await db.scans.find_one({"_id": ObjectId(scan_id), "user_id": current_user["id"]})
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    return {
        "id": str(scan["_id"]),
        "created_at": scan["created_at"],
        "images": scan.get("images", {}),
        "analysis": scan.get("analysis"),
        "processing_status": scan.get("processing_status")
    }

