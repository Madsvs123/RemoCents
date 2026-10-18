from ..utils.database import db
from datetime import datetime
from sqlalchemy import Enum

class InterviewStatus(Enum):
    SCHEDULED = 'scheduled'
    CONFIRMED = 'confirmed'
    CANCELLED = 'cancelled'
    COMPLETED = 'completed'
    NO_SHOW = 'no_show'

class InterviewType(Enum):
    PHONE = 'phone'
    VIDEO = 'video'
    IN_PERSON = 'in_person'

class Interview(db.Model):
    __tablename__ = 'interviews'
    
    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, db.ForeignKey('applications.id'), nullable=False)
    scheduled_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    interview_type = db.Column(Enum(InterviewType), nullable=False)
    status = db.Column(Enum(InterviewStatus), default=InterviewStatus.SCHEDULED)
    scheduled_time = db.Column(db.DateTime, nullable=False)
    duration_minutes = db.Column(db.Integer, default=30)
    location = db.Column(db.String(255))  # URL for video, address for in-person
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    application = db.relationship('Application', backref=db.backref('interviews', lazy=True))
    scheduler = db.relationship('User', foreign_keys=[scheduled_by])
    
    def to_dict(self):
        return {
            'id': self.id,
            'application_id': self.application_id,
            'scheduled_by': self.scheduled_by,
            'interview_type': self.interview_type.value if self.interview_type else None,
            'status': self.status.value if self.status else None,
            'scheduled_time': self.scheduled_time.isoformat() if self.scheduled_time else None,
            'duration_minutes': self.duration_minutes,
            'location': self.location,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def is_upcoming(self):
        """Check if interview is upcoming"""
        return self.status in [InterviewStatus.SCHEDULED, InterviewStatus.CONFIRMED] and \
               self.scheduled_time > datetime.utcnow()
    
    def is_past(self):
        """Check if interview is in the past"""
        return self.scheduled_time < datetime.utcnow()
