from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..utils.database import db
from ..models.job import Job
from ..models.company import Company

search_bp = Blueprint('search', __name__)

@search_bp.route('/jobs', methods=['GET'])
@jwt_required(optional=True)
def search_jobs():
    """Search jobs with advanced filters"""
    query = request.args.get('q', '')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    
    # Parse filters
    filters = {}
    if 'skills' in request.args:
        filters['skills'] = request.args.get('skills').split(',')
    if 'location' in request.args:
        filters['location'] = request.args.get('location')
    if 'salary_min' in request.args:
        filters['salary_min'] = request.args.get('salary_min')
    if 'is_remote' in request.args:
        filters['is_remote'] = request.args.get('is_remote').lower() == 'true'
    
    # Use search service
    current_app = request.args.get('current_app', None)
    if current_app:
        search_service = current_app.search_service
    else:
        from ..app import create_app
        app = create_app()
        search_service = app.search_service
    
    result = search_service.search_jobs(query, filters, page, per_page)
    
    # Serialize jobs
    jobs_data = [job.to_dict() for job in result['jobs']]
    
    return jsonify({
        'success': True,
        'data': {
            'jobs': jobs_data,
            'total': result['total'],
            'page': result['page'],
            'per_page': result['per_page'],
            'highlights': result['highlights']
        }
    })

@search_bp.route('/companies', methods=['GET'])
@jwt_required(optional=True)
def search_companies():
    """Search companies"""
    query = request.args.get('q', '')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    
    current_app = request.args.get('current_app', None)
    if current_app:
        search_service = current_app.search_service
    else:
        from ..app import create_app
        app = create_app()
        search_service = app.search_service
    
    result = search_service.search_companies(query, page, per_page)
    
    # Serialize companies
    companies_data = [company.to_dict() for company in result['companies']]
    
    return jsonify({
        'success': True,
        'data': {
            'companies': companies_data,
            'total': result['total'],
            'page': result['page'],
            'per_page': result['per_page']
        }
    })

@search_bp.route('/skills/suggest', methods=['GET'])
def suggest_skills():
    """Get skill suggestions"""
    query = request.args.get('q', '')
    size = int(request.args.get('size', 5))
    
    current_app = request.args.get('current_app', None)
    if current_app:
        search_service = current_app.search_service
    else:
        from ..app import create_app
        app = create_app()
        search_service = app.search_service
    
    suggestions = search_service.suggest_skills(query, size)
    
    return jsonify({
        'success': True,
        'data': {
            'suggestions': suggestions
        }
    })
