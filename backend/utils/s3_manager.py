# backend/utils/s3_manager.py
import boto3
from botocore.exceptions import ClientError
from werkzeug.utils import secure_filename
import logging
from typing import BinaryIO, Optional
from datetime import datetime
import base64
import mimetypes

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
            logging.error(f"S3 upload error: {str(e)}")
            logging.error(f"Error Code: {e.response['Error']['Code']}")
            logging.error(f"Error Message: {e.response['Error']['Message']}")
            raise
    
    def upload_base64(self, base64_str: str, user_id: str, filename: str = None) -> str:
        """
        Upload a base64-encoded image string to S3.
        If no filename is provided, generate one based on the current timestamp.

        :param base64_str: Base64 image data (no data URI prefix)
        :param user_id: ID of the user uploading the file
        :param filename: (Optional) Filename to use for the uploaded file
        :return: Public URL of the uploaded image
        """
        try:
            file_data = base64.b64decode(base64_str)
            # If no filename is given, create one
            if not filename:
                filename = f"image_{datetime.utcnow().timestamp()}.png"
            else:
                filename = secure_filename(filename)

            # Attempt to guess content type
            content_type, _ = mimetypes.guess_type(filename)
            if not content_type:
                # Default to PNG if unknown
                content_type = 'image/png'

            key = f"users/{user_id}/flashcards/{datetime.utcnow().isoformat()}_{filename}"

            self.s3.put_object(
                Bucket=self.bucket,
                Key=key,
                Body=file_data,
                ContentType=content_type
            )

            return f"https://{self.bucket}.s3.amazonaws.com/{key}"
        except ClientError as e:
            logging.error(f"S3 base64 upload error: {str(e)}")
            logging.error(f"Error Code: {e.response['Error']['Code']}")
            logging.error(f"Error Message: {e.response['Error']['Message']}")
            raise
        except Exception as e:
            logging.error(f"Unexpected error in base64 upload: {e}", exc_info=True)
            raise

    def get_file(self, key: str) -> Optional[bytes]:
        try:
            response = self.s3.get_object(Bucket=self.bucket, Key=key)
            return response['Body'].read()
        except ClientError as e:
            logging.error(f"S3 download error: {str(e)}")
            logging.error(f"Error Code: {e.response['Error']['Code']}")
            logging.error(f"Error Message: {e.response['Error']['Message']}")
            raise

    def delete_file(self, key: str) -> bool:
        try:
            self.s3.delete_object(Bucket=self.bucket, Key=key)
            return True
        except ClientError as e:
            logging.error(f"S3 deletion error: {str(e)}")
            logging.error(f"Error Code: {e.response['Error']['Code']}")
            logging.error(f"Error Message: {e.response['Error']['Message']}")
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
            logging.error(f"S3 pre-signed URL generation error: {str(e)}")
            logging.error(f"Error Code: {e.response['Error']['Code']}")
            logging.error(f"Error Message: {e.response['Error']['Message']}")
            return None

# Create a default instance
s3_manager = S3Manager