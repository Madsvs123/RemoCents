from flask import jsonify
from werkzeug.exceptions import HTTPException


def register_error_handlers(app):
    """Register error handlers for the Flask application."""
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'error': 'Bad Request',
            'message': error.description or 'The request contains invalid data.'
        }), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            'error': 'Unauthorized',
            'message': error.description or 'Authentication is required.'
        }), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            'error': 'Forbidden',
            'message': error.description or 'You do not have permission to access this resource.'
        }), 403
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'error': 'Not Found',
            'message': error.description or 'The requested resource was not found.'
        }), 404
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            'error': 'Method Not Allowed',
            'message': error.description or 'The HTTP method is not allowed for this resource.'
        }), 405
    
    @app.errorhandler(409)
    def conflict(error):
        return jsonify({
            'error': 'Conflict',
            'message': error.description or 'A conflict occurred while processing the request.'
        }), 409
    
    @app.errorhandler(413)
    def payload_too_large(error):
        return jsonify({
            'error': 'Payload Too Large',
            'message': error.description or 'The request payload is too large.'
        }), 413
    
    @app.errorhandler(415)
    def unsupported_media_type(error):
        return jsonify({
            'error': 'Unsupported Media Type',
            'message': error.description or 'The request contains an unsupported media type.'
        }), 415
    
    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({
            'error': 'Internal Server Error',
            'message': error.description or 'An unexpected error occurred on the server.'
        }), 500
    
    @app.errorhandler(Exception)
    def handle_exception(error):
        # Log the error
        app.logger.error(f'Unhandled exception: {str(error)}')
        
        if isinstance(error, HTTPException):
            return jsonify({
                'error': error.name,
                'message': error.description
            }), error.code
        
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'An unexpected error occurred on the server.'
        }), 500