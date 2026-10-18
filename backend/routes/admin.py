from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.user import User
from models.role import Role
from utils.auth import admin_required, get_current_user
from utils.validators import UpdateUserRoleValidator
from models import db

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_users():
    """Get all users (admin only)."""
    try:
        page = int(request.args.get('page', 1))
        page_size = min(int(request.args.get('page_size', 10)), 100)
        search = request.args.get('search', '')
        role = request.args.get('role', '')
        
        # Build query
        query = User.query
        
        # Apply filters
        if search:
            query = query.filter(
                (User.username.ilike(f'%{search}%')) | 
                (User.email.ilike(f'%{search}%')) | 
                (User.first_name.ilike(f'%{search}%')) | 
                (User.last_name.ilike(f'%{search}%'))
            )
        
        if role:
            role_obj = Role.query.filter_by(name=role).first()
            if role_obj:
                query = query.filter_by(role_id=role_obj.id)
        
        # Pagination
        paginated_users = query.paginate(page=page, per_page=page_size, error_out=False)
        
        return jsonify({
            'users': [user.to_dict() for user in paginated_users.items],
            'total': paginated_users.total,
            'pages': paginated_users.pages,
            'current_page': paginated_users.page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@admin_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@jwt_required()
@admin_required
def update_user_role(user_id):
    """Update user role (admin only)."""
    try:
        data = request.get_json()
        validator = UpdateUserRoleValidator(**data)
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get role
        role = Role.query.filter_by(name=validator.role).first()
        
        if not role:
            return jsonify({'error': 'Role not found'}), 404
        
        # Update user role
        user.role_id = role.id
        db.session.commit()
        
        return jsonify({
            'message': 'User role updated successfully',
            'user': user.to_dict()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@admin_bp.route('/users/<int:user_id>/activate', methods=['PUT'])
@jwt_required()
@admin_required
def activate_user(user_id):
    """Activate a user account (admin only)."""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        user.is_active = True
        db.session.commit()
        
        return jsonify({
            'message': 'User activated successfully',
            'user': user.to_dict()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@admin_bp.route('/users/<int:user_id>/deactivate', methods=['PUT'])
@jwt_required()
@admin_required
def deactivate_user(user_id):
    """Deactivate a user account (admin only)."""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Don't allow deactivating self
    current_user = get_current_user()
    if user.id == current_user.id:
        return jsonify({'error': 'Cannot deactivate your own account'}), 403
    
    try:
        user.is_active = False
        db.session.commit()
        
        return jsonify({
            'message': 'User deactivated successfully',
            'user': user.to_dict()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400