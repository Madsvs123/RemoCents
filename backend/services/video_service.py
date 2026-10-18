import os
import uuid
import tempfile
from datetime import datetime
from ..config import Config
from ..models.video_resume import VideoResume
from ..utils.database import db
from ..utils.files import allowed_file, get_file_extension
from celery import Celery
import moviepy.editor as mp
import boto3
from botocore.exceptions import NoCredentialsError

celery = Celery(
    'video_tasks',
    broker=Config.CELERY_BROKER_URL,
    backend=Config.CELERY_RESULT_BACKEND
)

class VideoService:
    def __init__(self):
        self.s3_client = None
        if Config.AWS_ACCESS_KEY_ID and Config.AWS_SECRET_ACCESS_KEY:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=Config.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=Config.AWS_SECRET_ACCESS_KEY,
                region_name=Config.AWS_REGION
            )
    
    def upload_video_resume(self, file, user_id, application_id=None):
        """Upload and process video resume"""
        if not allowed_file(file.filename, Config.ALLOWED_EXTENSIONS):
            raise ValueError("File type not allowed")
        
        # Validate video duration and size
        temp_path = self._validate_video_file(file)
        
        # Generate unique filename
        ext = get_file_extension(file.filename)
        filename = f"video_resume_{user_id}_{uuid.uuid4().hex}{ext}"
        
        # Save to local storage or S3
        if self.s3_client:
            s3_key = f"video_resumes/{filename}"
            self.s3_client.upload_file(temp_path, Config.AWS_S3_BUCKET, s3_key)
            video_url = f"https://{Config.AWS_S3_BUCKET}.s3.{Config.AWS_REGION}.amazonaws.com/{s3_key}"
        else:
            # Local storage fallback
            os.makedirs(Config.VIDEO_UPLOAD_FOLDER, exist_ok=True)
            filepath = os.path.join(Config.VIDEO_UPLOAD_FOLDER, filename)
            file.save(filepath)
            video_url = f"/videos/{filename}"
        
        # Create video resume record
        video_resume = VideoResume(
            user_id=user_id,
            application_id=application_id,
            original_filename=file.filename,
            storage_path=video_url,
            file_size=os.path.getsize(temp_path),
            status='processing'
        )
        
        db.session.add(video_resume)
        db.session.commit()
        
        # Process video in background
        process_video_task.delay(video_resume.id, temp_path)
        
        # Clean up temp file
        os.unlink(temp_path)
        
        return video_resume
    
    def _validate_video_file(self, file):
        """Validate video file and return temp path"""
        # Save to temp file
        temp_fd, temp_path = tempfile.mkstemp(suffix=get_file_extension(file.filename))
        file.save(temp_path)
        os.close(temp_fd)
        
        # Check file size
        file_size = os.path.getsize(temp_path) / (1024 * 1024)  # MB
        if file_size > Config.VIDEO_MAX_SIZE:
            os.unlink(temp_path)
            raise ValueError(f"Video size exceeds {Config.VIDEO_MAX_SIZE}MB limit")
        
        # Check video duration
        try:
            video = mp.VideoFileClip(temp_path)
            duration = video.duration
            video.close()
            
            if duration > Config.VIDEO_MAX_DURATION:
                os.unlink(temp_path)
                raise ValueError(f"Video duration exceeds {Config.VIDEO_MAX_DURATION} seconds limit")
        except Exception as e:
            os.unlink(temp_path)
            raise ValueError(f"Invalid video file: {str(e)}")
        
        return temp_path
    
    def get_video_resume(self, video_id):
        """Get video resume by ID"""
        return VideoResume.query.get(video_id)
    
    def get_user_video_resumes(self, user_id):
        """Get all video resumes for a user"""
        return VideoResume.query.filter_by(user_id=user_id)
            .order_by(VideoResume.created_at.desc())
            .all()
    
    def delete_video_resume(self, video_id):
        """Delete video resume"""
        video = VideoResume.query.get(video_id)
        if video:
            # Delete from S3 if applicable
            if self.s3_client and video.storage_path.startswith('https://'):
                # Extract key from URL
                parts = video.storage_path.split('/')
                if len(parts) >= 4:
                    bucket = parts[2].split('.')[0]
                    key = '/'.join(parts[3:])
                    try:
                        self.s3_client.delete_object(Bucket=bucket, Key=key)
                    except Exception as e:
                        print(f"Error deleting from S3: {e}")
            
            # Delete local file if applicable
            if not video.storage_path.startswith('http'):
                try:
                    file_path = os.path.join(Config.VIDEO_UPLOAD_FOLDER, 
                                           os.path.basename(video.storage_path))
                    if os.path.exists(file_path):
                        os.unlink(file_path)
                except Exception as e:
                    print(f"Error deleting local file: {e}")
            
            db.session.delete(video)
            db.session.commit()
            return True
        return False

@celery.task
def process_video_task(video_id, temp_path):
    """Background task to process video resume"""
    from ..models.video_resume import VideoResume
    from ..utils.database import db
    from ..services.nlp_service import NLPService
    import time
    
    try:
        # Simulate processing time
        time.sleep(5)
        
        # Get video resume
        video = VideoResume.query.get(video_id)
        if not video:
            return
        
        # Update status
        video.status = 'processing_transcript'
        db.session.commit()
        
        # Extract audio and generate transcript (simplified)
        # In a real implementation, we would use speech recognition
        video.status = 'processing_analysis'
        db.session.commit()
        
        # Analyze content (simplified)
        nlp_service = NLPService()
        # This would extract keywords, sentiment, etc. from transcript
        
        # Generate thumbnail
        video.status = 'processing_thumbnail'
        db.session.commit()
        
        # Finalize
        video.status = 'completed'
        video.processed_at = datetime.utcnow()
        db.session.commit()
        
        return True
    
    except Exception as e:
        # Update status to failed
        video = VideoResume.query.get(video_id)
        if video:
            video.status = f'failed: {str(e)}'
            db.session.commit()
        return False
    
    finally:
        # Clean up temp file
        try:
            if os.path.exists(temp_path):
                os.unlink(temp_path)
        except:
            pass
