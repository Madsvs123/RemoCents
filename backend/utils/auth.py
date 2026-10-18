from functools import wraps
from flask import jsonify, current_app
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from models.user import User
from models.role import Role


def admin_required(fn):
    """Decorator to require admin role."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or current_user.role.name != 'admin':
            return jsonify({
                'error': 'Forbidden',
                'message': 'Admin role required for this action.'
            }), 403
        
        return fn(*args, **kwargs)
    return wrapper


def employer_required(fn):
    """Decorator to require employer role."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or current_user.role.name not in ['admin', 'employer']:
            return jsonify({
                'error': 'Forbidden',
                'message': 'Employer role required for this action.'
            }), 403
        
        return fn(*args, **kwargs)
    return wrapper


def applicant_required(fn):
    """Decorator to require applicant role."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or current_user.role.name not in ['admin', 'applicant']:
            return jsonify({
                'error': 'Forbidden',
                'message': 'Applicant role required for this action.'
            }), 403
        
        return fn(*args, **kwargs)
    return wrapper


def role_required(*roles):
    """Decorator to require specific roles."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            current_user = User.query.get(current_user_id)
            
            if not current_user or current_user.role.name not in roles:
                return jsonify({
                    'error': 'Forbidden',
                    'message': f'One of these roles required: {", ".join(roles)}'
                }), 403
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def get_current_user():
    """Get the current authenticated user."""
    try:
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        return User.query.get(current_user_id)
    except:
        return None


def get_current_user_id():
    """Get the current authenticated user ID."""
    try:
        verify_jwt_in_request()
        return get_jwt_identity()
    except:
        return None