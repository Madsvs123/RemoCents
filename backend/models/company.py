from datetime import datetime
from . import db


class Company(db.Model):
    """Company model for employer information."""
    
    __tablename__ = 'companies'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    description = db.Column(db.Text)
    website = db.Column(db.String(255))
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    address = db.Column(db.String(255))
    logo = db.Column(db.String(255))
    industry = db.Column(db.String(80))
    founded_year = db.Column(db.Integer)
    employee_count = db.Column(db.Integer)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    def to_dict(self):
        """Convert company to dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'website': self.website,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'logo': self.logo,
            'industry': self.industry,
            'founded_year': self.founded_year,
            'employee_count': self.employee_count,
            'is_verified': self.is_verified,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Company {self.name}>'