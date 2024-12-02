from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    MONGODB_URI = os.getenv('MONGODB_URI')
    AWS_ACCESS_KEY = os.getenv('AWS_ACCESS_KEY')
    AWS_SECRET_KEY = os.getenv('AWS_SECRET_KEY')
    S3_BUCKET = os.getenv('S3_BUCKET')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    ALLOWED_EXTENSIONS = {'pdf', 'txt', 'doc', 'docx', 'jpg', 'png','jpeg'}
    OPENAI_API_KEY = os.getenv('OPEN_AI_KEY')