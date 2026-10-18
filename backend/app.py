from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_mail import Mail
from flask_socketio import SocketIO
from config import config_dict
import os

# Initialize extensions
migrate = Migrate()
jwt = JWTManager()
mail = Mail()
socketio = SocketIO(cors_allowed_origins="*")


def create_app(config_name='default'):
    """Create and configure the Flask application."""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config_dict[config_name])
    
    # Initialize extensions
    migrate.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    socketio.init_app(app)
    
    # Enable CORS
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    # Create uploads directories if they don't exist
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    if not os.path.exists(app.config['VIDEO_UPLOAD_FOLDER']):
        os.makedirs(app.config['VIDEO_UPLOAD_FOLDER'])
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.jobs import jobs_bp
    from routes.applications import applications_bp
    from routes.companies import companies_bp
    from routes.admin import admin_bp
    from routes.main import main_bp
    from routes.search import search_bp
    from routes.notifications import notification_bp
    from routes.videos import video_bp
    from routes.interviews import interview_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(jobs_bp, url_prefix='/api/jobs')
    app.register_blueprint(applications_bp, url_prefix='/api/applications')
    app.register_blueprint(companies_bp, url_prefix='/api/companies')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(main_bp, url_prefix='/api')
    app.register_blueprint(search_bp, url_prefix='/api/search')
    app.register_blueprint(notification_bp, url_prefix='/api/notifications')
    app.register_blueprint(video_bp, url_prefix='/api/videos')
    app.register_blueprint(interview_bp, url_prefix='/api/interviews')
    
    # Initialize services
    from services.search_service import SearchService
    from services.notification_service import NotificationService
    from services.video_service import VideoService
    from services.nlp_service import NLPService
    
    app.search_service = SearchService()
    app.notification_service = NotificationService()
    app.video_service = VideoService()
    app.nlp_service = NLPService()
    
    # Initialize notification service with SocketIO
    app.notification_service.init_app(app)
    
    # Register error handlers
    from utils.error_handlers import register_error_handlers
    register_error_handlers(app)
    
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)