#!/bin/bash

# JobApply Project - Scaled Setup Script
# This script sets up the enhanced version with all advanced features

echo "🚀 Setting up JobApply Project - Scaled Version"
echo "=============================================="

# Check for required tools
echo "🔧 Checking dependencies..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+."
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9+."
    exit 1
fi

echo "✅ All required tools are installed!"

# Create environment files
echo "📝 Creating environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
else
    echo "ℹ️  backend/.env already exists"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env"
else
    echo "ℹ️  frontend/.env already exists"
fi

# Create upload directories
echo "📁 Creating upload directories..."
mkdir -p backend/uploads
mkdir -p backend/uploads/videos
mkdir -p frontend/public/uploads

echo "✅ Directories created"

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
cd backend || exit 1

if [ -d "venv" ]; then
    echo "ℹ️  Using existing virtual environment"
else
    python3 -m venv venv
    echo "✅ Created virtual environment"
fi

source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Install NLP models
echo "🧠 Installing NLP models..."
python -m spacy download en_core_web_sm

deactivate
cd ..

echo "✅ Python dependencies installed"

# Install JavaScript dependencies
echo "⚛️ Installing JavaScript dependencies..."
cd frontend || exit 1
npm install
cd ..

echo "✅ JavaScript dependencies installed"

# Build frontend
echo "🔨 Building frontend..."
cd frontend || exit 1
npm run build
cd ..

echo "✅ Frontend built successfully"

# Start services
echo "🚀 Starting services with Docker..."
echo "This may take a few minutes..."

docker-compose -f docker-compose.scaled.yml down
docker-compose -f docker-compose.scaled.yml up --build -d

echo "✅ Services started!"

# Wait for database to be ready
echo "⏳ Waiting for database to initialize..."
sleep 10

# Run database migrations
echo "📥 Running database migrations..."
docker-compose -f docker-compose.scaled.yml exec backend flask db upgrade

echo "✅ Database migrations completed"

# Initialize Elasticsearch indices
echo "🔍 Initializing Elasticsearch indices..."
docker-compose -f docker-compose.scaled.yml exec backend python -c "
from app import create_app
from services.search_service import SearchService
app = create_app()
with app.app_context():
    search_service = SearchService()
    print('Elasticsearch indices created')
"

echo "✅ Elasticsearch indices created"

echo ""
echo "🎉 Setup complete!"
echo "=================="
echo ""
echo "🌐 Access the application at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000/api"
echo "   Admin:    http://localhost:5000/api/admin"
echo ""
echo "📝 Default credentials:"
echo "   Admin:     admin@example.com / password"
echo "   Employer:  employer@example.com / password"
echo "   Applicant: applicant@example.com / password"
echo ""
echo "💡 To stop services: docker-compose -f docker-compose.scaled.yml down"
echo "💡 To view logs: docker-compose -f docker-compose.scaled.yml logs -f"
echo ""

# Show service status
echo "📊 Service status:"
docker-compose -f docker-compose.scaled.yml ps