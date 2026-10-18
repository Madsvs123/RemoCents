from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.job import Job
from models.application import Application
from models.user import User
from utils.auth import get_current_user, employer_required
from utils.validators import JobValidator
from utils.files import save_file
from models import db
from datetime import datetime

jobs_bp = Blueprint('jobs', __name__)

@jobs_bp.route('/', methods=['GET'])
def get_jobs():
    """Get all active jobs with pagination and filtering."""
    try:
        # Get query parameters
        page = int(request.args.get('page', 1))
        page_size = min(int(request.args.get('page_size', 10)), 100)
        search = request.args.get('search', '')
        location = request.args.get('location', '')
        job_type = request.args.get('job_type', '')
        experience_level = request.args.get('experience_level', '')
        
        # Build query
        query = Job.query.filter_by(is_active=True)
        
        # Apply filters
        if search:
            query = query.filter(Job.title.ilike(f'%{search}%'))
        
        if location:
            query = query.filter(Job.location.ilike(f'%{location}%'))
        
        if job_type:
            query = query.filter_by(job_type=job_type)
        
        if experience_level:
            query = query.filter_by(experience_level=experience_level)
        
        # Pagination
        paginated_jobs = query.paginate(page=page, per_page=page_size, error_out=False)
        
        return jsonify({
            'jobs': [job.to_dict() for job in paginated_jobs.items],
            'total': paginated_jobs.total,
            'pages': paginated_jobs.pages,
            'current_page': paginated_jobs.page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@jobs_bp.route('/<int:job_id>', methods=['GET'])
def get_job(job_id):
    """Get job details by ID."""
    job = Job.query.get(job_id)
    
    if not job or not job.is_active:
        return jsonify({'error': 'Job not found'}), 404
    
    return jsonify(job.to_dict())

@jobs_bp.route('/my-jobs', methods=['GET'])
@jwt_required()
@employer_required
def get_my_jobs():
    """Get jobs posted by current employer."""
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get jobs posted by current user
    jobs = Job.query.filter_by(posted_by_id=current_user.id).all()
    
    return jsonify([job.to_dict() for job in jobs])

@jobs_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@employer_required
def get_dashboard():
    """Get employer dashboard statistics."""
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get jobs posted by current user
    jobs = Job.query.filter_by(posted_by_id=current_user.id).all()
    
    # Get applications for these jobs
    job_ids = [job.id for job in jobs]
    applications = Application.query.filter(Application.job_id.in_(job_ids)).all()
    
    # Calculate statistics
    active_jobs = len([job for job in jobs if job.is_active])
    total_applications = len(applications)
    
    # Applications by status
    status_counts = {}
    for app in applications:
        status = app.status
        status_counts[status] = status_counts.get(status, 0) + 1
    
    return jsonify({
        'active_jobs': active_jobs,
        'total_applications': total_applications,
        'applications_by_status': status_counts,
        'recent_jobs': [job.to_dict() for job in jobs[-5:]]  # Last 5 jobs
    })

@jobs_bp.route('/', methods=['POST'])
@jwt_required()
@employer_required
def create_job():
    """Create a new job posting."""
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        # Get form data
        data = request.form.to_dict()
        validator = JobValidator(**data)
        
        # Create new job
        job = Job(
            title=validator.title,
            description=validator.description,
            requirements=validator.requirements,
            responsibilities=validator.responsibilities,
            location=validator.location,
            salary_min=validator.salary_min,
            salary_max=validator.salary_max,
            salary_currency=validator.salary_currency,
            job_type=validator.job_type,
            experience_level=validator.experience_level,
            education_level=validator.education_level,
            is_remote=validator.is_remote,
            is_active=validator.is_active,
            application_deadline=validator.application_deadline,
            company_id=current_user.company_id,
            posted_by_id=current_user.id
        )
        
        db.session.add(job)
        db.session.commit()
        
        return jsonify({
            'message': 'Job created successfully',
            'job': job.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@jobs_bp.route('/<int:job_id>', methods=['PUT'])
@jwt_required()
@employer_required
def update_job(job_id):
    """Update a job posting."""
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    # Check if current user is the owner of the job
    if job.posted_by_id != current_user.id:
        return jsonify({'error': 'You can only update your own jobs'}), 403
    
    try:
        data = request.form.to_dict()
        validator = JobValidator(**data)
        
        # Update job fields
        job.title = validator.title
        job.description = validator.description
        job.requirements = validator.requirements
        job.responsibilities = validator.responsibilities
        job.location = validator.location
        job.salary_min = validator.salary_min
        job.salary_max = validator.salary_max
        job.salary_currency = validator.salary_currency
        job.job_type = validator.job_type
        job.experience_level = validator.experience_level
        job.education_level = validator.education_level
        job.is_remote = validator.is_remote
        job.is_active = validator.is_active
        job.application_deadline = validator.application_deadline
        job.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Job updated successfully',
            'job': job.to_dict()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@jobs_bp.route('/<int:job_id>', methods=['DELETE'])
@jwt_required()
@employer_required
def delete_job(job_id):
    """Delete a job posting."""
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    
    # Check if current user is the owner of the job
    if job.posted_by_id != current_user.id:
        return jsonify({'error': 'You can only delete your own jobs'}), 403
    
    try:
        db.session.delete(job)
        db.session.commit()
        
        return jsonify({'message': 'Job deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400