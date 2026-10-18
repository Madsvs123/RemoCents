from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Import models to register them with SQLAlchemy
from .user import User
from .job import Job
from .application import Application
from .company import Company
from .role import Role