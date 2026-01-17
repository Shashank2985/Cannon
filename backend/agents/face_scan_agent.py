"""
Face Scan Agent
High-level interface for face analysis
"""

from typing import Optional
from models.scan import ScanAnalysis
from agents.langgraph_workflow import run_face_analysis_pipeline


class FaceScanAgent:
    """Agent for performing face scan analysis"""
    
    def __init__(self):
        """Initialize the face scan agent"""
        pass
    
    async def analyze(
        self,
        front_image: bytes,
        left_image: bytes,
        right_image: bytes
    ) -> ScanAnalysis:
        """
        Analyze face images and return comprehensive results
        
        Args:
            front_image: Front-facing photo bytes
            left_image: Left profile photo bytes
            right_image: Right profile photo bytes
            
        Returns:
            ScanAnalysis with all metrics, improvements, and recommendations
        """
        return await run_face_analysis_pipeline(front_image, left_image, right_image)


# Singleton instance
face_scan_agent = FaceScanAgent()
