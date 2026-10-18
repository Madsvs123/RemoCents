from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from ..utils.database import db
from ..models.video_resume import VideoResume
from ..utils.auth import role_required
from ..models.role import Role

video_bp = Blueprint('videos', __name__)

@video_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_video_resume():
    """Upload video resume"""
    current_user_id = get_jwt_identity()
    
    # Check if file is present
    if 'video' not in request.files:
        return jsonify({'success': False, 'message': 'No video file provided'}), 400
    
    video_file = request.files['video']
    application_id = request.form.get('application_id')
    
    if video_file.filename == '':
        return jsonify({'success': False, 'message': 'No selected file'}), 400
    
    # Use video service
    video_service = current_app.video_service
    
    try:
        video_resume = video_service.upload_video_resume(
            video_file,
            current_user_id,
            application_id if application_id else None
        )
        
        return jsonify({
            'success': True,
            'message': 'Video resume uploaded successfully',
            'data': video_resume.to_dict()
        })
    
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': 'Error processing video'}), 500

@video_bp.route('/<int:video_id>', methods=['GET'])
@jwt_required()
def get_video_resume(video_id):
    """Get video resume details"""
    current_user_id = get_jwt_identity()
    
    video_resume = VideoResume.query.get(video_id)
    
    if not video_resume:
        return jsonify({'success': False, 'message': 'Video resume not found'}), 404
    
    # Check ownership or admin role
    if video_resume.user_id != current_user_id:
        current_user = current_app.jwt_manager._user_lookup_callback(get_jwt_identity())
        if not current_user or not current_user.has_role(Role.ADMIN):
            return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    return jsonify({
        'success': True,
        'data': video_resume.to_dict()
    })

@video_bp.route('/user', methods=['GET'])
@jwt_required()
def get_user_video_resumes():
    """Get all video resumes for current user"""
    current_user_id = get_jwt_identity()
    
    video_service = current_app.video_service
    video_resumes = video_service.get_user_video_resumes(current_user_id)
    
    videos_data = [video.to_dict() for video in video_resumes]
    
    return jsonify({
        'success': True,
        'data': videos_data
    })

@video_bp.route('/<int:video_id>', methods=['DELETE'])
@jwt_required()
def delete_video_resume(video_id):
    """Delete video resume"""
    current_user_id = get_jwt_identity()
    
    video_resume = VideoResume.query.get(video_id)
    
    if not video_resume:
        return jsonify({'success': False, 'message': 'Video resume not found'}), 404
    
    # Check ownership
    if video_resume.user_id != current_user_id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    video_service = current_app.video_service
    success = video_service.delete_video_resume(video_id)
    
    if success:
        return jsonify({'success': True, 'message': 'Video resume deleted successfully'})
    else:
        return jsonify({'success': False, 'message': 'Failed to delete video resume'}), 500

@video_bp.route('/<int:video_id>/status', methods=['GET'])
@jwt_required()
def get_video_status(video_id):
    """Get video processing status"""
    current_user_id = get_jwt_identity()
    
    video_resume = VideoResume.query.get(video_id)
    
    if not video_resume:
        return jsonify({'success': False, 'message': 'Video resume not found'}), 404
    
    # Check ownership
    if video_resume.user_id != current_user_id:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    return jsonify({
        'success': True,
        'data': {
            'status': video_resume.status,
            'processed_at': video_resume.processed_at.isoformat() if video_resume.processed_at else None
        }
    })
