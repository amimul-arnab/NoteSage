# backend/utils/s3_manager.py
import boto3
from botocore.exceptions import ClientError
from werkzeug.utils import secure_filename
import logging
from typing import BinaryIO, Optional

class S3Manager:
    def __init__(self, config):
        self.s3 = boto3.client(
            's3',
            aws_access_key_id=config.AWS_ACCESS_KEY,
            aws_secret_access_key=config.AWS_SECRET_KEY
        )
        self.bucket = config.S3_BUCKET

    def upload_file(self, file: BinaryIO, user_id: str) -> str:
        try:
            filename = secure_filename(file.filename)
            key = f"users/{user_id}/{filename}"
            self.s3.upload_fileobj(
                file,
                self.bucket,
                key,
                ExtraArgs={'ContentType': file.content_type} if hasattr(file, 'content_type') else None
            )
            return f"https://{self.bucket}.s3.amazonaws.com/{key}"
        except ClientError as e:
            logging.error(f"S3 upload error: {e}")
            raise

    def get_file(self, key: str) -> Optional[bytes]:
        try:
            response = self.s3.get_object(Bucket=self.bucket, Key=key)
            return response['Body'].read()
        except ClientError as e:
            logging.error(f"S3 download error: {e}")
            raise

    def delete_file(self, key: str) -> bool:
        try:
            self.s3.delete_object(Bucket=self.bucket, Key=key)
            return True
        except ClientError as e:
            logging.error(f"S3 deletion error: {e}")
            raise

    def generate_presigned_url(self, key: str, expiration=3600) -> Optional[str]:
        """
        Generate a pre-signed URL for the S3 object.
        
        Args:
            key (str): S3 key of the file.
            expiration (int): Expiration time in seconds for the pre-signed URL (default: 1 hour).
            
        Returns:
            Optional[str]: Pre-signed URL if successful, None otherwise.
        """
        try:
            url = self.s3.generate_presigned_url('get_object',
                Params={'Bucket': self.bucket, 'Key': key},
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            logging.error(f"S3 pre-signed URL generation error: {e}")
            return None

# Create a default instance
s3_manager = S3Manager
