from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.company import Company
from models.user import User
from utils.auth import get_current_user, employer_required, admin_required
from utils.validators import CompanyValidator
from utils.files import save_file
from models import db

companies_bp = Blueprint('companies', __name__)

@companies_bp.route('/', methods=['GET'])
def get_companies():
    """Get all companies with pagination."""
    try:
        page = int(request.args.get('page', 1))
        page_size = min(int(request.args.get('page_size', 10)), 100)
        search = request.args.get('search', '')
        industry = request.args.get('industry', '')
        
        # Build query
        query = Company.query
        
        # Apply filters
        if search:
            query = query.filter(Company.name.ilike(f'%{search}%'))
        
        if industry:
            query = query.filter_by(industry=industry)
        
        # Pagination
        paginated_companies = query.paginate(page=page, per_page=page_size, error_out=False)
        
        return jsonify({
            'companies': [company.to_dict() for company in paginated_companies.items],
            'total': paginated_companies.total,
            'pages': paginated_companies.pages,
            'current_page': paginated_companies.page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@companies_bp.route('/<int:company_id>', methods=['GET'])
def get_company(company_id):
    """Get company details by ID."""
    company = Company.query.get(company_id)
    
    if not company:
        return jsonify({'error': 'Company not found'}), 404
    
    return jsonify(company.to_dict())

@companies_bp.route('/me', methods=['GET'])
@jwt_required()
@employer_required
def get_my_company():
    """Get company associated with current employer."""
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    
    if not current_user.company:
        return jsonify({'error': 'No company associated with this account'}), 404
    
    return jsonify(current_user.company.to_dict())

@companies_bp.route('/', methods=['POST'])
@jwt_required()
@employer_required
def create_company():
    """Create a new company."""
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if user already has a company
    if current_user.company:
        return jsonify({'error': 'User already has a company'}), 409
    
    try:
        data = request.form.to_dict()
        validator = CompanyValidator(**data)
        
        # Handle logo upload
        logo_filename = None
        if 'logo' in request.files:
            logo_file = request.files['logo']
            if logo_file.filename != '':
                logo_filename = save_file(logo_file, 'logos')
        
        # Create new company
        company = Company(
            name=validator.name,
            description=validator.description,
            website=validator.website,
            email=validator.email,
            phone=validator.phone,
            address=validator.address,
            logo=logo_filename,
            industry=validator.industry,
            founded_year=validator.founded_year,
            employee_count=validator.employee_count,
            created_by=current_user.id
        )
        
        db.session.add(company)
        db.session.commit()
        
        # Associate company with user
        current_user.company_id = company.id
        db.session.commit()
        
        return jsonify({
            'message': 'Company created successfully',
            'company': company.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@companies_bp.route('/<int:company_id>', methods=['PUT'])
@jwt_required()
@employer_required
def update_company(company_id):
    """Update company information."""
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({'error': 'User not found'}), 404
    
    company = Company.query.get(company_id)
    
    if not company:
        return jsonify({'error': 'Company not found'}), 404
    
    # Check if current user is the owner of the company
    if company.created_by != current_user.id:
        return jsonify({'error': 'You can only update your own company'}), 403
    
    try:
        data = request.form.to_dict()
        validator = CompanyValidator(**data)
        
        # Update company fields
        company.name = validator.name
        company.description = validator.description
        company.website = validator.website
        company.email = validator.email
        company.phone = validator.phone
        company.address = validator.address
        company.industry = validator.industry
        company.founded_year = validator.founded_year
        company.employee_count = validator.employee_count
        
        # Handle logo update
        if 'logo' in request.files:
            logo_file = request.files['logo']
            if logo_file.filename != '':
                # Delete old logo if it exists
                if company.logo:
                    from utils.files import delete_file
                    delete_file(company.logo, 'logos')
                
                # Save new logo
                logo_filename = save_file(logo_file, 'logos')
                company.logo = logo_filename
        
        db.session.commit()
        
        return jsonify({
            'message': 'Company updated successfully',
            'company': company.to_dict()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400