from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash
from models.user import User
from models.role import Role
from utils.validators import RegisterValidator, LoginValidator, UpdateProfileValidator
from utils.auth import get_current_user
from utils.files import save_profile_picture
from models import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user."""
    try:
        data = request.get_json()
        validator = RegisterValidator(**data)
        
        # Check if user already exists
        if User.query.filter_by(email=validator.email).first():
            return jsonify({'error': 'Email already registered'}), 409
        
        if User.query.filter_by(username=validator.username).first():
            return jsonify({'error': 'Username already taken'}), 409
        
        # Get default role (applicant)
        role = Role.query.filter_by(name='applicant').first()
        if not role:
            role = Role(name='applicant', description='Default applicant role')
            db.session.add(role)
            db.session.commit()
        
        # Create new user
        user = User(
            username=validator.username,
            email=validator.email,
            password=validator.password,
            first_name=validator.first_name,
            last_name=validator.last_name,
            role_id=role.id
        )
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and return JWT token."""
    try:
        data = request.get_json()
        validator = LoginValidator(**data)
        
        user = User.query.filter_by(email=validator.email).first()
        
        if not user or not user.check_password(validator.password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is disabled'}), 403
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile."""
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(current_user.to_dict())

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile."""
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        data = request.get_json()
        validator = UpdateProfileValidator(**data)
        
        # Update user fields
        if validator.first_name:
            current_user.first_name = validator.first_name
        if validator.last_name:
            current_user.last_name = validator.last_name
        if validator.phone:
            current_user.phone = validator.phone
        if validator.address:
            current_user.address = validator.address
        if validator.bio:
            current_user.bio = validator.bio
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': current_user.to_dict()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@auth_bp.route('/profile-picture', methods=['PUT'])
@jwt_required()
def update_profile_picture():
    """Update user profile picture."""
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Save profile picture
    filename = save_profile_picture(file, current_user.id)
    
    if filename:
        # Delete old profile picture if it exists
        if current_user.profile_picture:
            from utils.files import delete_file
            delete_file(current_user.profile_picture, 'profile_pictures')
        
        current_user.profile_picture = filename
        db.session.commit()
        
        return jsonify({
            'message': 'Profile picture updated successfully',
            'profile_picture': filename
        })
    
    return jsonify({'error': 'Failed to save profile picture'}), 400