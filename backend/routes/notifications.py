from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.notification import Notification
from ..utils.database import db

notification_bp = Blueprint('notifications', __name__)

@notification_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    """Get user notifications"""
    current_user_id = get_jwt_identity()
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))
    
    current_app = request.args.get('current_app', None)
    if current_app:
        notification_service = current_app.notification_service
    else:
        from ..app import create_app
        app = create_app()
        notification_service = app.notification_service
    
    pagination = notification_service.get_user_notifications(current_user_id, page, per_page)
    
    notifications_data = [notification.to_dict() for notification in pagination.items]
    
    return jsonify({
        'success': True,
        'data': {
            'notifications': notifications_data,
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': pagination.page
        }
    })

@notification_bp.route('/<int:notification_id>/read', methods=['POST'])
@jwt_required()
def mark_notification_read(notification_id):
    """Mark notification as read"""
    current_app = request.args.get('current_app', None)
    if current_app:
        notification_service = current_app.notification_service
    else:
        from ..app import create_app
        app = create_app()
        notification_service = app.notification_service
    
    success = notification_service.mark_as_read(notification_id)
    
    if success:
        return jsonify({'success': True, 'message': 'Notification marked as read'})
    else:
        return jsonify({'success': False, 'message': 'Notification not found'}), 404

@notification_bp.route('/read-all', methods=['POST'])
@jwt_required()
def mark_all_notifications_read():
    """Mark all notifications as read"""
    current_user_id = get_jwt_identity()
    
    current_app = request.args.get('current_app', None)
    if current_app:
        notification_service = current_app.notification_service
    else:
        from ..app import create_app
        app = create_app()
        notification_service = app.notification_service
    
    success = notification_service.mark_all_as_read(current_user_id)
    
    if success:
        return jsonify({'success': True, 'message': 'All notifications marked as read'})
    else:
        return jsonify({'success': False, 'message': 'Failed to mark notifications as read'}), 500

@notification_bp.route('/count', methods=['GET'])
@jwt_required()
def get_unread_count():
    """Get unread notifications count"""
    current_user_id = get_jwt_identity()
    
    unread_count = Notification.query.filter_by(
        user_id=current_user_id,
        is_read=False
    ).count()
    
    return jsonify({
        'success': True,
        'data': {
            'unread_count': unread_count
        }
    })
