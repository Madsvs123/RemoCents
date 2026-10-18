# RemoCents

A job application platform with a modern React frontend and a Python backend.

## 📁 Project Structure

```
RemoCents/
├── backend/          # Python Flask backend
├── frontend/         # React frontend with Chakra UI
├── docker-compose.yml # Docker configuration
├── setup.sh          # Setup script
└── README.md         # This file
```

## 🚀 Features

### Frontend (React + Chakra UI)

- **Modern UI**: Beautiful, responsive interface using Chakra UI
- **Job Listings**: Browse and search job postings
- **Applications**: Apply for jobs with resume upload
- **User Profiles**: Manage personal information and profile
- **Company Profiles**: Company pages with detailed information
- **Dashboard**: Personalized dashboard for users and employers
- **Admin Panel**: User management and system administration

### Backend (Python + Flask)

- **RESTful API**: Clean, well-documented API endpoints
- **JWT Authentication**: Secure authentication with role-based access
- **PostgreSQL**: Robust relational database
- **File Uploads**: Resume and profile picture handling
- **PDF/DOCX Parsing**: Extract text from resumes
- **Validation**: Comprehensive data validation
- **Error Handling**: Consistent error responses

## 🛠️ Technology Stack

### Frontend

- **Framework**: React 18
- **UI Library**: Chakra UI
- **State Management**: React Context API
- **Routing**: React Router v6
- **Forms**: Formik + Yup
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Animation**: Framer Motion

### Backend

- **Framework**: Flask
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: Flask-JWT-Extended
- **Validation**: Pydantic
- **File Processing**: Pillow, PyPDF2, python-docx
- **Testing**: Pytest

### DevOps

- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Environment**: Python virtualenv
- **Package Management**: npm, pip

## 📋 Prerequisites

- Node.js 18+
- Python 3.9+
- PostgreSQL 12+
- Docker (optional)
- npm / yarn
- pip

## 🔧 Installation

### Option 1: Manual Setup

1. **Clone the repository**:

```bash
git clone https://github.com/Madsvs123/RemoCents.git
cd RemoCents
```

2. **Set up backend**:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python init_db.py
```

3. **Set up frontend**:

```bash
cd ../frontend
npm install
cp .env.example .env
```

4. **Run the application**:

```bash
# In one terminal - backend
cd backend
flask run

# In another terminal - frontend
cd frontend
npm start
```

### Option 2: Using Setup Script

```bash
chmod +x setup.sh
./setup.sh
```

### Option 3: Docker (Recommended)

```bash
docker-compose up --build
```

## 🌐 Access the Application

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000/api`
- **API Documentation**: `http://localhost:5000/api/`

## 📂 Project Structure

### Backend Structure

```
backend/
├── app.py                  # Main application
├── config.py               # Configuration
├── init_db.py              # Database initialization
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables
├── Dockerfile              # Docker configuration
├── models/                 # Database models
│   ├── __init__.py
│   ├── user.py
│   ├── role.py
│   ├── company.py
│   ├── job.py
│   └── application.py
├── routes/                 # API routes
│   ├── auth.py
│   ├── jobs.py
│   ├── applications.py
│   ├── companies.py
│   ├── admin.py
│   └── main.py
├── services/               # Business logic
├── utils/                  # Utility functions
│   ├── auth.py
│   ├── database.py
│   ├── error_handlers.py
│   ├── files.py
│   └── validators.py
└── tests/                  # Tests
```

### Frontend Structure

```
frontend/
├── public/                # Static files
├── src/
│   ├── theme/             # Chakra UI theme
│   │   └── chakraTheme.js
│   ├── contexts/          # React context
│   ├── services/          # API services
│   ├── components/       # Reusable components
│   │   ├── common/        # Common UI components
│   │   ├── jobs/          # Job-related components
│   │   ├── applications/  # Application components
│   │   └── dashboard/     # Dashboard components
│   ├── pages/             # Page components
│   ├── routes/            # Routing configuration
│   ├── utils/             # Utility functions
│   ├── App.js             # Main app component
│   └── index.js           # Entry point
├── package.json           # npm dependencies
├── Dockerfile             # Docker configuration
└── .env                    # Environment variables
```

## 🎨 Frontend with Chakra UI

The frontend has been redesigned using Chakra UI for a modern, accessible, and responsive interface.

### Key Chakra UI Components Used

- **Layout**: `Box`, `Flex`, `Grid`, `Stack`
- **Typography**: `Text`, `Heading`
- **Forms**: `Input`, `Textarea`, `Select`, `FormControl`, `FormLabel`
- **Buttons**: `Button`, `IconButton`
- **Navigation**: `Tabs`, `Breadcrumb`
- **Feedback**: `Alert`, `Spinner`, `Toast`
- **Modals**: `Modal`, `ModalOverlay`, `ModalContent`
- **Cards**: `Card`, `CardHeader`, `CardBody`, `CardFooter`

### Example Component

```jsx
import { Button, Box, Text } from "@chakra-ui/react";

function ChakraButton({ children, ...props }) {
  return (
    <Button 
      colorScheme="brand"
      px={6}
      py={2}
      fontWeight="medium"
      borderRadius="md"
      _hover={{ 
        transform: "translateY(-1px)",
        boxShadow: "md"
      }}
      transition="all 0.2s"
      {...props}
    >
      {children}
    </Button>
  );
}
```

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. **Register**: Create a new account
2. **Login**: Authenticate and receive JWT token
3. **Protected Routes**: Include token in `Authorization` header
4. **Role-Based Access**: Different permissions for applicants, employers, and admins

### Roles

- **Applicant**: Can browse jobs, apply for positions, manage applications
- **Employer**: Can post jobs, manage company profile, view applicants
- **Admin**: Full access to user management and system settings

## 📊 API Endpoints

### Authentication

- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile

### Jobs

- `GET /api/jobs` - List jobs
- `POST /api/jobs` - Create job
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Applications

- `POST /api/applications` - Submit application
- `GET /api/applications/me` - My applications
- `PUT /api/applications/:id/status` - Update status

### Companies

- `GET /api/companies` - List companies
- `POST /api/companies` - Create company
- `GET /api/companies/:id` - Get company details

### Admin

- `GET /api/admin/users` - List users
- `PUT /api/admin/users/:id/role` - Update user role

## 📱 Responsive Design

The application is fully responsive and works on:

- Desktop (1200px+)
- Tablet (768px-1199px)
- Mobile (<768px)

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 🚀 Deployment

### Docker Deployment

```bash
docker-compose up --build -d
```

### Manual Deployment

1. Build frontend:

```bash
cd frontend
npm run build
```

2. Run backend:

```bash
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

3. Serve frontend (using nginx, Apache, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Create a pull request

## 📝 License

This project is licensed under the [MIT License](LICENSE).

## 🙏 Acknowledgements

- Chakra UI team for the amazing UI library
- Flask community for the excellent framework
- React team for the powerful frontend library

## 📬 Contact

For questions or support, please open an issue on GitHub.