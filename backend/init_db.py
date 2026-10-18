#!/usr/bin/env python3
"""Initialize the database and create tables."""

import os
import sys

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from utils.database import init_db, create_admin_user

def main():
    # Create Flask application
    app = create_app('development')
    
    with app.app_context():
        print("Initializing database...")
        init_db(app)
        print("Database initialized successfully!")
        
        # Create admin user
        admin_email = os.environ.get('ADMIN_EMAIL', 'admin@example.com')
        admin_username = os.environ.get('ADMIN_USERNAME', 'admin')
        admin_password = os.environ.get('ADMIN_PASSWORD', 'admin123')
        
        print(f"Creating admin user: {admin_email}")
        admin = create_admin_user(admin_email, admin_username, admin_password)
        
        if admin:
            print(f"Admin user created: {admin.email}")
        else:
            print("Admin user already exists or could not be created")

if __name__ == '__main__':
    main()