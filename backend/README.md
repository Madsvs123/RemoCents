# JobApply Backend API

A Flask-based RESTful API for the JobApply project using PostgreSQL.

## Features

- **Authentication**: JWT-based authentication with role-based access control
- **User Management**: User registration, login, profile management
- **Job Postings**: Create, read, update, delete job listings
- **Applications**: Submit and manage job applications
- **Company Profiles**: Company creation and management
- **Admin Dashboard**: User management and system administration
- **File Uploads**: Resume and profile picture uploads
- **PDF/DOCX Parsing**: Extract text from resumes

## Technology Stack

- **Framework**: Flask
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: Flask-JWT-Extended
- **File Handling**: Werkzeug, Pillow, PyPDF2, python-docx
- **Validation**: Pydantic
- **Testing**: Pytest

## Setup

### Prerequisites

- Python 3.9+
- PostgreSQL 12+
- pip

### Installation

1. Clone the repository:

```bash
cd JobApplyProject/backend
```

2. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Set up environment variables:

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

5. Initialize the database:

```bash
python init_db.py
```

6. Run the development server:

```bash
flask run
```

The API will be available at `http://localhost:5000/api`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/profile-picture` - Update profile picture

### Jobs

- `GET /api/jobs` - Get all active jobs
- `GET /api/jobs/<id>` - Get job details
- `GET /api/jobs/my-jobs` - Get jobs posted by current user
- `GET /api/jobs/dashboard` - Get employer dashboard statistics
- `POST /api/jobs` - Create a new job
- `PUT /api/jobs/<id>` - Update a job
- `DELETE /api/jobs/<id>` - Delete a job

### Applications

- `POST /api/applications` - Submit a job application
- `POST /api/applications/parse` - Parse resume text
- `GET /api/applications/me` - Get my applications
- `GET /api/applications/applicants` - Get applicants for my jobs
- `GET /api/applications/all` - Get all applications (admin)
- `PUT /api/applications/<id>/status` - Update application status

### Companies

- `GET /api/companies` - Get all companies
- `GET /api/companies/<id>` - Get company details
- `GET /api/companies/me` - Get my company
- `POST /api/companies` - Create a company
- `PUT /api/companies/<id>` - Update a company

### Admin

- `GET /api/admin/users` - Get all users (admin)
- `PUT /api/admin/users/<id>/role` - Update user role (admin)
- `PUT /api/admin/users/<id>/activate` - Activate user (admin)
- `PUT /api/admin/users/<id>/deactivate` - Deactivate user (admin)

## Database Models

### User

- `id`: Integer (Primary Key)
- `username`: String (Unique)
- `email`: String (Unique)
- `password_hash`: String
- `first_name`: String
- `last_name`: String
- `phone`: String
- `address`: String
- `profile_picture`: String
- `bio`: Text
- `is_active`: Boolean
- `role_id`: Integer (Foreign Key)
- `company_id`: Integer (Foreign Key)

### Role

- `id`: Integer (Primary Key)
- `name`: String (Unique)
- `description`: String

### Company

- `id`: Integer (Primary Key)
- `name`: String (Unique)
- `description`: Text
- `website`: String
- `email`: String
- `phone`: String
- `address`: String
- `logo`: String
- `industry`: String
- `founded_year`: Integer
- `employee_count`: Integer
- `is_verified`: Boolean
- `created_by`: Integer (Foreign Key)

### Job

- `id`: Integer (Primary Key)
- `title`: String
- `description`: Text
- `requirements`: Text
- `responsibilities`: Text
- `location`: String
- `salary_min`: Numeric
- `salary_max`: Numeric
- `salary_currency`: String
- `job_type`: String
- `experience_level`: String
- `education_level`: String
- `is_remote`: Boolean
- `is_active`: Boolean
- `application_deadline`: DateTime
- `company_id`: Integer (Foreign Key)
- `posted_by_id`: Integer (Foreign Key)

### Application

- `id`: Integer (Primary Key)
- `status`: String
- `cover_letter`: Text
- `resume`: String
- `applied_at`: DateTime
- `updated_at`: DateTime
- `job_id`: Integer (Foreign Key)
- `applicant_id`: Integer (Foreign Key)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After logging in, include the token in the `Authorization` header:

```
Authorization: Bearer <your-token>
```

## Error Handling

The API returns standard HTTP status codes and JSON error responses:

```json
{
  "error": "Error type",
  "message": "Error description"
}
```

## Testing

Run tests with:

```bash
pytest
```

## Deployment

### Docker

Build and run with Docker:

```bash
docker-compose up --build
```

### Environment Variables

Create a `.env` file with the following variables:

```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET_KEY=your-jwt-secret
JWT_ACCESS_TOKEN_EXPIRES=3600
UPLOAD_FOLDER=uploads
MAIL_SERVER=smtp.example.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@example.com
MAIL_PASSWORD=your-email-password
```

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

MIT