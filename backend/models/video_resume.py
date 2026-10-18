from ..utils.database import db
from datetime import datetime

class VideoResume(db.Model):
    __tablename__ = 'video_resumes'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    application_id = db.Column(db.Integer, db.ForeignKey('applications.id'))
    original_filename = db.Column(db.String(255), nullable=False)
    storage_path = db.Column(db.String(512), nullable=False)
    file_size = db.Column(db.Integer)  # in bytes
    status = db.Column(db.String(50), default='uploaded')
    processed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, 
                          onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('video_resumes', lazy=True))
    application = db.relationship('Application', backref=db.backref('video_resume', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'application_id': self.application_id,
            'original_filename': self.original_filename,
            'storage_path': self.storage_path,
            'file_size': self.file_size,
            'status': self.status,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
