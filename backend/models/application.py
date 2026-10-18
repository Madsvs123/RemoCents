from datetime import datetime
from . import db


class Application(db.Model):
    """Application model for job applications."""
    
    __tablename__ = 'applications'
    
    id = db.Column(db.Integer, primary_key=True)
    status = db.Column(db.String(50), default='pending')
    cover_letter = db.Column(db.Text)
    resume = db.Column(db.String(255))
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    match_score = db.Column(db.Float)  # Match score with job (0-100)
    video_resume_id = db.Column(db.Integer, db.ForeignKey('video_resumes.id'))
    
    # Relationships
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    applicant_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    video_resume = db.relationship('VideoResume', backref=db.backref('application', lazy=True))
    
    def to_dict(self):
        """Convert application to dictionary."""
        return {
            'id': self.id,
            'status': self.status,
            'cover_letter': self.cover_letter,
            'resume': self.resume,
            'job_id': self.job_id,
            'applicant_id': self.applicant_id,
            'match_score': self.match_score,
            'video_resume_id': self.video_resume_id,
            'applied_at': self.applied_at.isoformat() if self.applied_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Application {self.id}>'