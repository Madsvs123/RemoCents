from flask import Blueprint, jsonify

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    """Main API endpoint."""
    return jsonify({
        'message': 'Welcome to JobApply API',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth',
            'jobs': '/api/jobs',
            'applications': '/api/applications',
            'companies': '/api/companies',
            'admin': '/api/admin'
        }
    })

@main_bp.route('/health')
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    })

# Import datetime at the top
from datetime import datetime