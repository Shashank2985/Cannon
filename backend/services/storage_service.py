"""
Storage Service - S3 image storage
"""

import boto3
from botocore.exceptions import ClientError
from typing import Optional
import uuid
from datetime import datetime
from config import settings


class StorageService:
    """AWS S3 storage for scan images"""
    
    def __init__(self):
        self.s3_client = boto3.client(
            "s3",
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            region_name=settings.aws_s3_region
        )
        self.bucket = settings.aws_s3_bucket
    
    async def upload_image(
        self,
        image_data: bytes,
        user_id: str,
        image_type: str = "front"  # front, left, right
    ) -> Optional[str]:
        """
        Upload an image to S3
        Returns the URL of the uploaded image
        """
        try:
            # Generate unique key
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            unique_id = str(uuid.uuid4())[:8]
            key = f"scans/{user_id}/{timestamp}_{image_type}_{unique_id}.jpg"
            
            # Upload to S3
            self.s3_client.put_object(
                Bucket=self.bucket,
                Key=key,
                Body=image_data,
                ContentType="image/jpeg"
            )
            
            # Generate URL
            url = f"https://{self.bucket}.s3.{settings.aws_s3_region}.amazonaws.com/{key}"
            return url
            
        except ClientError as e:
            print(f"S3 upload error: {e}")
            return None
    
    async def get_image(self, key: str) -> Optional[bytes]:
        """Download an image from S3"""
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket,
                Key=key
            )
            return response["Body"].read()
        except ClientError as e:
            print(f"S3 download error: {e}")
            return None
    
    async def delete_image(self, key: str) -> bool:
        """Delete an image from S3"""
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket,
                Key=key
            )
            return True
        except ClientError as e:
            print(f"S3 delete error: {e}")
            return False
    
    def get_presigned_url(self, key: str, expiration: int = 3600) -> Optional[str]:
        """Generate a presigned URL for temporary access"""
        try:
            url = self.s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket, "Key": key},
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            print(f"Presigned URL error: {e}")
            return None


# Singleton instance
storage_service = StorageService()
