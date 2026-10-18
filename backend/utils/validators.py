import re
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime


class RegisterValidator(BaseModel):
    username: str = Field(..., min_length=3, max_length=80)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    first_name: str = Field(..., min_length=1, max_length=80)
    last_name: str = Field(..., min_length=1, max_length=80)
    
    @validator('username')
    def validate_username(cls, value):
        if not re.match(r'^[a-zA-Z0-9_]+$', value):
            raise ValueError('Username can only contain letters, numbers, and underscores')
        return value


class LoginValidator(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class UpdateProfileValidator(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=80)
    last_name: Optional[str] = Field(None, min_length=1, max_length=80)
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    address: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = Field(None, max_length=500)


class CompanyValidator(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    description: Optional[str] = Field(None, max_length=1000)
    website: Optional[str] = Field(None, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, min_length=10, max_length=20)
    address: Optional[str] = Field(None, max_length=255)
    industry: Optional[str] = Field(None, max_length=80)
    founded_year: Optional[int] = Field(None, ge=1900, le=datetime.now().year)
    employee_count: Optional[int] = Field(None, ge=1)


class JobValidator(BaseModel):
    title: str = Field(..., min_length=5, max_length=120)
    description: str = Field(..., min_length=20, max_length=5000)
    requirements: Optional[str] = Field(None, max_length=5000)
    responsibilities: Optional[str] = Field(None, max_length=5000)
    location: Optional[str] = Field(None, max_length=120)
    salary_min: Optional[float] = Field(None, ge=0)
    salary_max: Optional[float] = Field(None, ge=0)
    salary_currency: Optional[str] = Field(None, min_length=1, max_length=3)
    job_type: Optional[str] = Field(None, max_length=50)
    experience_level: Optional[str] = Field(None, max_length=50)
    education_level: Optional[str] = Field(None, max_length=50)
    is_remote: Optional[bool] = False
    is_active: Optional[bool] = True
    application_deadline: Optional[datetime] = None
    
    @validator('application_deadline')
    def validate_deadline(cls, value):
        if value and value < datetime.now():
            raise ValueError('Application deadline must be in the future')
        return value


class ApplicationValidator(BaseModel):
    job_id: int = Field(..., ge=1)
    cover_letter: Optional[str] = Field(None, max_length=2000)
    status: Optional[str] = Field('pending', max_length=50)


class UpdateUserRoleValidator(BaseModel):
    role: str = Field(..., min_length=3, max_length=50)


def validate_email(email):
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_password(password):
    """Validate password strength."""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one digit"
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character"
    
    return True, "Password is valid"