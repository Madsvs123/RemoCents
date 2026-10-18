#!/bin/bash

# JobApply Project Setup Script

echo "🚀 Setting up JobApply Project..."

# Check if running as root
if [ "$(id -u)" -eq 0 ]; then
    echo "❌ Please do not run this script as root. Use a regular user with sudo privileges."
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend || exit 1

if [ -f "requirements.txt" ]; then
    if command -v pip &> /dev/null; then
        pip install -r requirements.txt
    else
        echo "❌ pip not found. Please install Python and pip first."
        exit 1
    fi
else
    echo "❌ requirements.txt not found in backend directory"
    exit 1
fi

cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend || exit 1

if [ -f "package.json" ]; then
    if command -v npm &> /dev/null; then
        npm install
    else
        echo "❌ npm not found. Please install Node.js and npm first."
        exit 1
    fi
else
    echo "❌ package.json not found in frontend directory"
    exit 1
fi

cd ..

# Set up environment variables
echo "🔧 Setting up environment variables..."

# Check if .env file exists in backend
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env 2>/dev/null || \
    echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/jobapply
SECRET_KEY=$(openssl rand -hex 32)
JWT_SECRET_KEY=$(openssl rand -hex 32)
DEBUG=True" > backend/.env
fi

# Check if .env file exists in frontend
if [ ! -f "frontend/.env" ]; then
    echo "REACT_APP_API_URL=http://localhost:5000/api" > frontend/.env
fi

echo "✅ Environment variables set up"

# Initialize database
echo "🗃️  Initializing database..."
cd backend || exit 1

if command -v python &> /dev/null; then
    python init_db.py
else
    echo "❌ Python not found. Database initialization skipped."
fi

cd ..

echo "✅ Database initialized"

echo "🎉 JobApply Project setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start the backend: cd backend && flask run"
echo "2. Start the frontend: cd frontend && npm start"
echo "3. Or use Docker: docker-compose up --build"
echo ""
echo "🌐 Access the application at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000/api"