from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from ..models.interview import Interview, InterviewStatus, InterviewType
from ..models.application import Application
from ..models.user import User
from ..utils.database import db
from ..utils.auth import role_required
from ..models.role import Role

interview_bp = Blueprint('interviews', __name__)

@interview_bp.route('/', methods=['POST'])
@jwt_required()
@role_required([Role.EMPLOYER, Role.ADMIN])
def schedule_interview():
    """Schedule a new interview"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['application_id', 'interview_type', 'scheduled_time', 'duration_minutes']
    for field in required_fields:
        if field not in data:
            return jsonify({'success': False, 'message': f'Missing required field: {field}'}), 400
    
    # Check if application exists
    application = Application.query.get(data['application_id'])
    if not application:
        return jsonify({'success': False, 'message': 'Application not found'}), 404
    
    # Validate interview type
    try:
        interview_type = InterviewType(data['interview_type'])
    except ValueError:
        return jsonify({'success': False, 'message': 'Invalid interview type'}), 400
    
    # Validate and parse scheduled time
    try:
        scheduled_time = datetime.fromisoformat(data['scheduled_time'])
    except ValueError:
        return jsonify({'success': False, 'message': 'Invalid scheduled time format'}), 400
    
    # Create interview
    current_user_id = get_jwt_identity()
    
    interview = Interview(
        application_id=data['application_id'],
        scheduled_by=current_user_id,
        interview_type=interview_type,
        status=InterviewStatus.SCHEDULED,
        scheduled_time=scheduled_time,
        duration_minutes=data['duration_minutes'],
        location=data.get('location', ''),
        notes=data.get('notes', '')
    )
    
    db.session.add(interview)
    db.session.commit()
    
    # Send notification to applicant
    applicant = User.query.get(application.applicant_id)
    if applicant:
        from ..services.notification_service import send_email_notification_task
        
        subject = f"New Interview Scheduled for {application.job.title}"
        body = f"Hello {applicant.first_name},\n\n" \
               f"You have a new interview scheduled:\n" \
               f"Type: {interview_type.value}\n" \
               f"Time: {scheduled_time.strftime('%Y-%m-%d %H:%M')}\n" \
               f"Duration: {data['duration_minutes']} minutes\n"
        if data.get('location'):
            body += f"Location: {data['location']}\n"
        if data.get('notes'):
            body += f"Notes: {data['notes']}\n"
        
        body += "\nPlease log in to confirm or reschedule."
        
        send_email_notification_task.delay(applicant.id, subject, body)
    
    return jsonify({
        'success': True,
        'message': 'Interview scheduled successfully',
        'data': interview.to_dict()
    })

@interview_bp.route('/<int:interview_id>', methods=['GET'])
@jwt_required()
def get_interview(interview_id):
    """Get interview details"""
    interview = Interview.query.get(interview_id)
    
    if not interview:
        return jsonify({'success': False, 'message': 'Interview not found'}), 404
    
    # Check permissions
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    # Applicant can see their own interviews
    # Employer can see interviews they scheduled
    # Admin can see all interviews
    application = Application.query.get(interview.application_id)
    
    if (application.applicant_id != current_user_id and 
        interview.scheduled_by != current_user_id and 
        not current_user.has_role(Role.ADMIN)):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    return jsonify({
        'success': True,
        'data': interview.to_dict()
    })

@interview_bp.route('/application/<int:application_id>', methods=['GET'])
@jwt_required()
def get_application_interviews(application_id):
    """Get all interviews for an application"""
    # Check if user has access to this application
    current_user_id = get_jwt_identity()
    application = Application.query.get(application_id)
    
    if not application:
        return jsonify({'success': False, 'message': 'Application not found'}), 404
    
    current_user = User.query.get(current_user_id)
    
    # Check permissions
    if (application.applicant_id != current_user_id and 
        not current_user.has_role(Role.EMPLOYER) and 
        not current_user.has_role(Role.ADMIN)):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    interviews = Interview.query.filter_by(application_id=application_id)
        .order_by(Interview.scheduled_time.asc())
        .all()
    
    interviews_data = [interview.to_dict() for interview in interviews]
    
    return jsonify({
        'success': True,
        'data': interviews_data
    })

@interview_bp.route('/user', methods=['GET'])
@jwt_required()
def get_user_interviews():
    """Get all interviews for current user"""
    current_user_id = get_jwt_identity()
    
    # Get interviews where user is applicant
    applicant_interviews = Interview.query.join(Application)
        .filter(Application.applicant_id == current_user_id)
        .order_by(Interview.scheduled_time.asc())
        .all()
    
    # Get interviews where user is scheduler (employer)
    scheduler_interviews = Interview.query
        .filter(Interview.scheduled_by == current_user_id)
        .order_by(Interview.scheduled_time.asc())
        .all()
    
    # Combine and remove duplicates
    all_interviews = list(set(applicant_interviews + scheduler_interviews))
    all_interviews.sort(key=lambda x: x.scheduled_time)
    
    interviews_data = [interview.to_dict() for interview in all_interviews]
    
    return jsonify({
        'success': True,
        'data': interviews_data
    })

@interview_bp.route('/<int:interview_id>/status', methods=['PUT'])
@jwt_required()
def update_interview_status(interview_id):
    """Update interview status"""
    interview = Interview.query.get(interview_id)
    
    if not interview:
        return jsonify({'success': False, 'message': 'Interview not found'}), 404
    
    data = request.get_json()
    if 'status' not in data:
        return jsonify({'success': False, 'message': 'Status is required'}), 400
    
    # Validate status
    try:
        new_status = InterviewStatus(data['status'])
    except ValueError:
        return jsonify({'success': False, 'message': 'Invalid status'}), 400
    
    # Check permissions
    current_user_id = get_jwt_identity()
    
    # Only scheduler or admin can update status
    if interview.scheduled_by != current_user_id:
        current_user = User.query.get(current_user_id)
        if not current_user.has_role(Role.ADMIN):
            return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    
    interview.status = new_status
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Interview status updated',
        'data': interview.to_dict()
    })

@interview_bp.route('/upcoming', methods=['GET'])
@jwt_required()
def get_upcoming_interviews():
    """Get upcoming interviews for current user"""
    current_user_id = get_jwt_identity()
    
    # Get upcoming interviews where user is applicant
    applicant_interviews = Interview.query.join(Application)
        .filter(
            Application.applicant_id == current_user_id,
            Interview.scheduled_time > datetime.utcnow(),
            Interview.status.in_([InterviewStatus.SCHEDULED, InterviewStatus.CONFIRMED])
        )
        .order_by(Interview.scheduled_time.asc())
        .all()
    
    # Get upcoming interviews where user is scheduler
    scheduler_interviews = Interview.query
        .filter(
            Interview.scheduled_by == current_user_id,
            Interview.scheduled_time > datetime.utcnow(),
            Interview.status.in_([InterviewStatus.SCHEDULED, InterviewStatus.CONFIRMED])
        )
        .order_by(Interview.scheduled_time.asc())
        .all()
    
    # Combine and remove duplicates
    upcoming_interviews = list(set(applicant_interviews + scheduler_interviews))
    upcoming_interviews.sort(key=lambda x: x.scheduled_time)
    
    interviews_data = [interview.to_dict() for interview in upcoming_interviews]
    
    return jsonify({
        'success': True,
        'data': interviews_data
    })
