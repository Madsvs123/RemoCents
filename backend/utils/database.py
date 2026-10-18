from models import db
from models.user import User
from models.role import Role
from models.company import Company
from models.job import Job
from models.application import Application


def init_db(app):
    """Initialize the database and create tables."""
    with app.app_context():
        db.create_all()
        seed_roles()


def seed_roles():
    """Seed default roles if they don't exist."""
    roles = ['admin', 'employer', 'applicant']
    
    for role_name in roles:
        if not Role.query.filter_by(name=role_name).first():
            role = Role(name=role_name, description=f'Default {role_name} role')
            db.session.add(role)
    
    db.session.commit()


def create_admin_user(email, username, password):
    """Create an admin user."""
    admin_role = Role.query.filter_by(name='admin').first()
    
    if not admin_role:
        admin_role = Role(name='admin', description='Administrator role')
        db.session.add(admin_role)
        db.session.commit()
    
    if not User.query.filter_by(email=email).first():
        admin_user = User(
            email=email,
            username=username,
            password=password,
            role_id=admin_role.id,
            first_name='Admin',
            last_name='User',
            is_active=True
        )
        db.session.add(admin_user)
        db.session.commit()
        return admin_user
    
    return None


def drop_all_tables():
    """Drop all database tables (use with caution)."""
    db.drop_all()