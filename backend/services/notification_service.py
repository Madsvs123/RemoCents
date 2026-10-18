import json
import time
from ..config import Config
from ..utils.database import db
from ..models.user import User
from ..models.notification import Notification
from celery import Celery
from flask_socketio import SocketIO

# Initialize Celery
celery = Celery(
    'notification_tasks',
    broker=Config.CELERY_BROKER_URL,
    backend=Config.CELERY_RESULT_BACKEND
)

# Initialize SocketIO
socketio = SocketIO(cors_allowed_origins="*")

class NotificationService:
    def __init__(self):
        self.connected_users = {}  # user_id: socket_id
    
    def init_app(self, app):
        socketio.init_app(app)
        
        @socketio.on('connect')
        def handle_connect():
            # Authentication would go here in production
            print(f"Client connected: {request.sid}")
        
        @socketio.on('disconnect')
        def handle_disconnect():
            # Remove user from connected users
            for user_id, sid in list(self.connected_users.items()):
                if sid == request.sid:
                    del self.connected_users[user_id]
                    break
            print(f"Client disconnected: {request.sid}")
        
        @socketio.on('register_user')
        def handle_register_user(data):
            user_id = data.get('user_id')
            if user_id:
                self.connected_users[user_id] = request.sid
                print(f"User registered for notifications: {user_id}")
    
    def send_notification(self, user_id, title, message, data=None, is_real_time=True):
        """Send notification to a user"""
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            data=json.dumps(data) if data else None,
            is_read=False
        )
        
        db.session.add(notification)
        db.session.commit()
        
        # Send real-time notification if user is connected
        if is_real_time and user_id in self.connected_users:
            socketio.emit('new_notification', {
                'id': notification.id,
                'title': title,
                'message': message,
                'data': data,
                'created_at': notification.created_at.isoformat()
            }, room=self.connected_users[user_id])
        
        return notification
    
    def broadcast_notification(self, user_ids, title, message, data=None):
        """Send notification to multiple users"""
        notifications = []
        for user_id in user_ids:
            notification = self.send_notification(user_id, title, message, data, False)
            notifications.append(notification)
        
        # Send real-time notifications to connected users
        for user_id in user_ids:
            if user_id in self.connected_users:
                socketio.emit('new_notification', {
                    'title': title,
                    'message': message,
                    'data': data,
                }, room=self.connected_users[user_id])
        
        return notifications
    
    def get_user_notifications(self, user_id, page=1, per_page=20):
        """Get paginated notifications for a user"""
        return Notification.query
            .filter_by(user_id=user_id)
            .order_by(Notification.created_at.desc())
            .paginate(page=page, per_page=per_page, error_out=False)
    
    def mark_as_read(self, notification_id):
        """Mark notification as read"""
        notification = Notification.query.get(notification_id)
        if notification:
            notification.is_read = True
            db.session.commit()
            return True
        return False
    
    def mark_all_as_read(self, user_id):
        """Mark all notifications as read for a user"""
        Notification.query.filter_by(user_id=user_id, is_read=False)
            .update({'is_read': True}, synchronize_session=False)
        db.session.commit()
        return True

# Celery tasks for background notifications
@celery.task
def send_email_notification_task(user_id, subject, body):
    """Background task to send email notifications"""
    from ..services.email_service import EmailService
    from ..models.user import User
    
    user = User.query.get(user_id)
    if user and user.email:
        email_service = EmailService()
        email_service.send_email(
            to=user.email,
            subject=subject,
            body=body
        )
    return True

@celery.task
def send_digest_notifications_task():
    """Send daily/weekly notification digests"""
    from ..models.user import User
    from datetime import datetime, timedelta
    
    # Get users who want digests
    users = User.query.filter_by(receive_digest=True).all()
    
    for user in users:
        # Get unread notifications from last 24 hours
        yesterday = datetime.utcnow() - timedelta(days=1)
        notifications = Notification.query.filter(
            Notification.user_id == user.id,
            Notification.is_read == False,
            Notification.created_at >= yesterday
        ).order_by(Notification.created_at.desc()).all()
        
        if notifications:
            # Format digest email
            subject = f"Your JobApply Digest - {len(notifications)} new notifications"
            body = f"Hello {user.first_name},\n\n"
            body += "You have new notifications:\n\n"
            
            for notification in notifications:
                body += f"• {notification.title}: {notification.message}\n"
            
            body += "\nLogin to view all notifications."
            
            # Send email
            send_email_notification_task.delay(user.id, subject, body)
