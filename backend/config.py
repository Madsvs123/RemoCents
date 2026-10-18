import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Existing config
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/jobapply')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-here')
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
    ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'mp4', 'mov'}
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload
    
    # New config for scaling
    ELASTICSEARCH_URL = os.getenv('ELASTICSEARCH_URL', 'http://localhost:9200')
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')
    CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
    AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
    AWS_S3_BUCKET = os.getenv('AWS_S3_BUCKET', 'jobapply-resumes')
    AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')
    
    # Video processing
    VIDEO_UPLOAD_FOLDER = os.getenv('VIDEO_UPLOAD_FOLDER', 'uploads/videos')
    VIDEO_MAX_DURATION = int(os.getenv('VIDEO_MAX_DURATION', '120'))  # 2 minutes
    VIDEO_MAX_SIZE = int(os.getenv('VIDEO_MAX_SIZE', '50'))  # 50MB
