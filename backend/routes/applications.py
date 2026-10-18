from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.application import Application
from models.job import Job
from utils.auth import get_current_user, applicant_required, employer_required
from utils.validators import ApplicationValidator
from utils.files import save_file, extract_text_from_pdf, extract_text_from_docx
from models import db
from datetime import datetime

applications_bp = Blueprint('applications', __name__)

@applications_bp.route('/', methods=['POST'])
@jwt_required()
@applicant_required
def submit_application():
    """Submit a job application."""
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    
    if 'job_id' not in request.form:
        return jsonify({'error': 'Job ID is required'}), 400
    
    job_id = request.form['job_id']
    job = Job.query.get(job_id)
    
    if not job or not job.is_active:
        return jsonify({'error': 'Job not found or not active'}), 404
    
    # Check if user already applied for this job
    existing_application = Application.query.filter_by(
        job_id=job_id,
        applicant_id=current_user.id
    ).first()
    
    if existing_application:
        return jsonify({'error': 'You have already applied for this job'}), 409
    
    try:
        # Validate application data
        data = {
            'job_id': job_id,
            'cover_letter': request.form.get('cover_letter', '')
        }
        validator = ApplicationValidator(**data)
        
        # Handle resume upload
        resume_filename = None
        if 'resume' in request.files:
            resume_file = request.files['resume']
            if resume_file.filename != '':
                resume_filename = save_file(resume_file, 'resumes')
        
        # Create application
        application = Application(
            job_id=validator.job_id,
            applicant_id=current_user.id,
            cover_letter=validator.cover_letter,
            resume=resume_filename,
            status='pending'
        )
        
        db.session.add(application)
        db.session.commit()
        
        return jsonify({
            'message': 'Application submitted successfully',
            'application': application.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@applications_bp.route('/parse', methods=['POST'])
@jwt_required()
@applicant_required
def parse_resume():
    """Parse resume and extract information."""
    if 'resume' not in request.files:
        return jsonify({'error': 'No resume file provided'}), 400
    
    resume_file = request.files['resume']
    
    if resume_file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    try:
        # Save the file temporarily
        temp_filename = save_file(resume_file, 'temp')
        
        if not temp_filename:
            return jsonify({'error': 'Failed to save resume file'}), 400
        
        # Extract text based on file type
        file_ext = resume_file.filename.rsplit('.', 1)[1].lower()
        extracted_text = None
        
        if file_ext == 'pdf':
            extracted_text = extract_text_from_pdf(f'uploads/temp/{temp_filename}')
        elif file_ext == 'docx':
            extracted_text = extract_text_from_docx(f'uploads/temp/{temp_filename}')
        
        # Clean up temporary file
        from utils.files import delete_file
        delete_file(temp_filename, 'temp')
        
        if extracted_text:
            return jsonify({
                'message': 'Resume parsed successfully',
                'text': extracted_text,
                'filename': resume_file.filename
            })
        else:
            return jsonify({'error': 'Failed to extract text from resume'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@applications_bp.route('/me', methods=['GET'])
@jwt_required()
@applicant_required
def get_my_applications():
    """Get applications submitted by current user."""
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    
    applications = Application.query.filter_by(applicant_id=current_user.id).all()
    
    return jsonify([app.to_dict() for app in applications])

@applications_bp.route('/applicants', methods=['GET'])
@jwt_required()
@employer_required
def get_applicants():
    """Get applications for jobs posted by current employer."""
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get jobs posted by current user
    from models.job import Job
    jobs = Job.query.filter_by(posted_by_id=current_user.id).all()
    job_ids = [job.id for job in jobs]
    
    # Get applications for these jobs
    applications = Application.query.filter(Application.job_id.in_(job_ids)).all()
    
    return jsonify([app.to_dict() for app in applications])

@applications_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_applications():
    """Get all applications (admin only)."""
    from utils.auth import admin_required
    
    @admin_required
    def get_all():
        applications = Application.query.all()
        return jsonify([app.to_dict() for app in applications])
    
    return get_all()

@applications_bp.route('/<int:application_id>/status', methods=['PUT'])
@jwt_required()
@employer_required
def update_application_status(application_id):
    """Update application status."""
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    
    application = Application.query.get(application_id)
    
    if not application:
        return jsonify({'error': 'Application not found'}), 404
    
    # Check if current user is the owner of the job
    job = Job.query.get(application.job_id)
    if job.posted_by_id != current_user.id:
        return jsonify({'error': 'You can only update applications for your own jobs'}), 403
    
    try:
        data = request.get_json()
        status = data.get('status')
        
        if not status:
            return jsonify({'error': 'Status is required'}), 400
        
        # Validate status
        valid_statuses = ['pending', 'reviewed', 'shortlisted', 'interview', 'hired', 'rejected']
        if status not in valid_statuses:
            return jsonify({'error': f'Invalid status. Must be one of: {valid_statuses}'}), 400
        
        application.status = status
        application.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Application status updated successfully',
            'application': application.to_dict()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400