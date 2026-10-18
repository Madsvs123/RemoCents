from datetime import datetime
from . import db


class Job(db.Model):
    """Job model for job postings."""
    
    __tablename__ = 'jobs'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    requirements = db.Column(db.Text)
    responsibilities = db.Column(db.Text)
    location = db.Column(db.String(120))
    salary_min = db.Column(db.Numeric(10, 2))
    salary_max = db.Column(db.Numeric(10, 2))
    salary_currency = db.Column(db.String(3))
    job_type = db.Column(db.String(50))
    experience_level = db.Column(db.String(50))
    education_level = db.Column(db.String(50))
    is_remote = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    application_deadline = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    company = db.relationship('Company', backref=db.backref('jobs', lazy=True))
    
    posted_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    applications = db.relationship('Application', backref='job', lazy=True)
    
    def to_dict(self):
        """Convert job to dictionary."""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'requirements': self.requirements,
            'responsibilities': self.responsibilities,
            'location': self.location,
            'salary_min': float(self.salary_min) if self.salary_min else None,
            'salary_max': float(self.salary_max) if self.salary_max else None,
            'salary_currency': self.salary_currency,
            'job_type': self.job_type,
            'experience_level': self.experience_level,
            'education_level': self.education_level,
            'is_remote': self.is_remote,
            'is_active': self.is_active,
            'application_deadline': self.application_deadline.isoformat() if self.application_deadline else None,
            'company_id': self.company_id,
            'company': self.company.to_dict() if self.company else None,
            'posted_by_id': self.posted_by_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Job {self.title}>'