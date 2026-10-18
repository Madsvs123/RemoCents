# JobApply Project - Scaled Version

This is the enhanced, production-ready version of the JobApply platform with advanced features and scalable architecture.

## 🚀 New Features

### Advanced Search
- **Elasticsearch Integration**: Full-text search with fuzzy matching
- **Skill-based Search**: Find jobs by specific skills
- **Location Filtering**: Search by city, state, or country
- **Salary Range**: Filter by minimum salary requirements
- **Remote Jobs**: Filter for remote-only positions
- **Skill Suggestions**: Auto-complete for skills based on job database

### Real-time Notifications
- **WebSocket Support**: Instant notifications for job updates
- **Notification Center**: Centralized notification management
- **Email Digests**: Daily/weekly notification summaries
- **Read Status**: Track which notifications you've seen

### Video Resumes
- **Video Upload**: Record and upload video introductions
- **Background Processing**: Automatic video transcoding
- **Cloud Storage**: AWS S3 integration for scalable storage
- **Size & Duration Limits**: Configurable limits (50MB, 2 minutes)

### Interview Scheduling
- **Multiple Types**: Phone, video, or in-person interviews
- **Calendar Integration**: Schedule with time zones
- **Status Tracking**: Scheduled, confirmed, completed, cancelled
- **Automated Reminders**: Email notifications for upcoming interviews

### Enhanced NLP Processing
- **Resume Parsing**: Extract text from PDF/DOCX resumes
- **Skill Extraction**: Identify key skills from resumes
- **Match Scoring**: Calculate compatibility with job requirements
- **Sentiment Analysis**: Analyze tone and sentiment
- **Entity Recognition**: Extract companies, locations, and more

## 🛠️ Scalable Architecture

### Microservices
- **Backend**: Flask REST API
- **Search**: Elasticsearch service
- **Real-time**: WebSocket notifications
- **Background Jobs**: Celery task queue
- **File Processing**: Dedicated video processing workers

### Technology Stack

#### Backend
- **Framework**: Flask + Python 3.9+
- **Database**: PostgreSQL 13+
- **Search**: Elasticsearch 7.15
- **Cache**: Redis 6
- **Task Queue**: Celery with Redis broker
- **File Storage**: AWS S3 (or local storage)
- **Video Processing**: MoviePy, OpenCV
- **NLP**: spaCy, NLTK, TextBlob

#### Frontend
- **Framework**: React 18
- **UI Library**: Chakra UI
- **State Management**: React Context API
- **Real-time**: Socket.IO client
- **Forms**: Formik + Yup
- **HTTP Client**: Axios

#### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Reverse Proxy**: Nginx
- **Monitoring**: Prometheus + Grafana (recommended)
- **Logging**: ELK Stack (recommended)

## 📋 Prerequisites

### Required
- Docker 20.10+
- Docker Compose 1.29+
- Node.js 18+
- Python 3.9+
- AWS credentials (for S3 storage)

### Optional (for local development)
- PostgreSQL 13+
- Redis 6+
- Elasticsearch 7.15+

## 🔧 Installation

### Option 1: Docker (Recommended)

```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Build and start all services
docker-compose -f docker-compose.scaled.yml up --build
```

### Option 2: Manual Setup

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Install NLP models
python -m spacy download en_core_web_sm

# Start backend
flask run
```

#### Celery Worker (in separate terminal)

```bash
cd backend
source venv/bin/activate
celery -A celery_worker.app worker --loglevel=info
```

#### Celery Beat (for scheduled tasks, separate terminal)

```bash
cd backend
source venv/bin/activate
celery -A celery_worker.app beat --loglevel=info
```

#### Frontend

```bash
cd frontend
npm install
npm start
```

## 🌐 Access the Application

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000/api`
- **API Documentation**: `http://localhost:5000/api/`
- **Elasticsearch**: `http://localhost:9200`
- **Redis**: `redis://localhost:6379`

## 📂 Project Structure (Enhanced)

```
JobApplyProject/
├── backend/
│   ├── app.py                  # Main application with SocketIO
│   ├── celery_worker.py        # Celery worker entry point
│   ├── config.py               # Enhanced configuration
│   ├── requirements.txt       # Updated dependencies
│   ├── services/
│   │   ├── search_service.py   # Elasticsearch integration
│   │   ├── notification_service.py # Real-time notifications
│   │   ├── video_service.py    # Video resume processing
│   │   ├── nlp_service.py      # NLP processing
│   │   └── email_service.py    # Email notifications
│   ├── models/
│   │   ├── notification.py     # Notification model
│   │   ├── video_resume.py     # Video resume model
│   │   └── interview.py        # Interview scheduling model
│   ├── routes/
│   │   ├── search.py           # Search API routes
│   │   ├── notifications.py   # Notification routes
│   │   ├── videos.py           # Video resume routes
│   │   └── interviews.py      # Interview routes
│   └── utils/
│       └── database.py        # Database utilities
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── searchService.js
│   │   │   ├── notificationService.js
│   │   │   ├── videoService.js
│   │   │   └── interviewService.js
│   │   ├── contexts/
│   │   │   └── NotificationContext.jsx
│   │   ├── components/
│   │   │   ├── navigation/
│   │   │   │   └── NotificationDropdown.jsx
│   │   │   ├── applications/
│   │   │   │   └── VideoResumeUpload.jsx
│   │   │   └── jobs/
│   │   │       └── EnhancedJobSearch.jsx
│   │   ├── pages/
│   │   │   └── NotificationsPage.jsx
│   │   └── App.js              # Updated with NotificationProvider
├── docker-compose.scaled.yml  # Enhanced Docker Compose
└── README.SCALED.md           # This file
```

## 🎨 New Frontend Components

### Notification System
- **NotificationDropdown**: Real-time notification indicator
- **NotificationsPage**: Full notification management
- **NotificationContext**: State management for notifications

### Enhanced Job Search
- **EnhancedJobSearch**: Advanced filtering with skill suggestions
- **Skill Auto-complete**: Real-time skill suggestions
- **Location Filtering**: Geo-based job search
- **Salary Range**: Minimum salary filtering

### Video Resumes
- **VideoResumeUpload**: Drag-and-drop video upload
- **Video Preview**: Preview before uploading
- **Processing Status**: Real-time upload progress

### Interview Management
- **Interview Scheduling**: Calendar integration
- **Status Tracking**: Visual status indicators
- **Upcoming Interviews**: Dashboard widget

## 📊 API Endpoints (New)

### Search
- `GET /api/search/jobs` - Advanced job search
- `GET /api/search/companies` - Company search
- `GET /api/search/skills/suggest` - Skill suggestions

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/count` - Unread count
- `WS /notifications` - WebSocket connection

### Video Resumes
- `POST /api/videos/upload` - Upload video resume
- `GET /api/videos/:id` - Get video details
- `GET /api/videos/user` - Get user videos
- `DELETE /api/videos/:id` - Delete video
- `GET /api/videos/:id/status` - Processing status

### Interviews
- `POST /api/interviews` - Schedule interview
- `GET /api/interviews/:id` - Get interview details
- `GET /api/interviews/application/:id` - Application interviews
- `GET /api/interviews/user` - User interviews
- `PUT /api/interviews/:id/status` - Update status
- `GET /api/interviews/upcoming` - Upcoming interviews

## 🤖 Background Tasks

### Celery Tasks
- `process_video_task`: Video processing (transcoding, thumbnail)
- `send_email_notification_task`: Email notifications
- `send_digest_notifications_task`: Daily/weekly digests

### Scheduled Tasks
- Daily notification digests
- Video processing cleanup
- Database maintenance

## 🔐 Security Enhancements

- **JWT Authentication**: Secure API access
- **Role-Based Access**: Fine-grained permissions
- **File Validation**: Strict file type and size checks
- **Input Sanitization**: Protection against injection
- **Rate Limiting**: Prevent abuse (recommended)

## 📈 Performance Optimization

- **Elasticsearch Indexing**: Fast job search
- **Redis Caching**: Reduced database load
- **Background Processing**: Non-blocking operations
- **CDN Integration**: Static asset delivery
- **Database Indexing**: Optimized queries

## 🚀 Deployment

### Production Setup

```bash
# Build production images
docker-compose -f docker-compose.scaled.yml build

# Start services
docker-compose -f docker-compose.scaled.yml up -d

# Run database migrations
docker-compose -f docker-compose.scaled.yml exec backend flask db upgrade

# Initialize Elasticsearch indices
docker-compose -f docker-compose.scaled.yml exec backend python init_elasticsearch.py
```

### Scaling

```bash
# Scale Celery workers
docker-compose -f docker-compose.scaled.yml up -d --scale celery-worker=4

# Scale backend services
docker-compose -f docker-compose.scaled.yml up -d --scale backend=3
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Load Testing (recommended)

```bash
# Install locust
pip install locust

# Run load test
locust -f backend/load_test.py
```

## 📬 Monitoring (Recommended)

### Prometheus + Grafana

Add to `docker-compose.scaled.yml`:

```yaml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - jobapply-network

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    volumes:
      - grafana-data:/var/lib/grafana
    networks:
      - jobapply-network
```

### Logging with ELK

```yaml
services:
  logstash:
    image: docker.elastic.co/logstash/logstash:7.15.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5000:5000"
    networks:
      - jobapply-network

  elasticsearch:
    # ... existing config ...

  kibana:
    image: docker.elastic.co/kibana/kibana:7.15.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
    networks:
      - jobapply-network
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Write tests
5. Update documentation
6. Create a pull request

## 📝 License

MIT

## 🙏 Acknowledgements

- Elasticsearch team for powerful search capabilities
- Celery team for robust task queue
- Chakra UI team for beautiful components
- spaCy team for excellent NLP tools

## 📬 Support

For questions or support, please open an issue on GitHub.

---

**Note**: This scaled version includes significant enhancements over the basic version. For simpler deployments, refer to the original `docker-compose.yml` and `README.md`.