from celery import Celery
from config import Config
from services.notification_service import celery as notification_celery
from services.video_service import celery as video_celery

# Create Celery app
app = Celery(
    'jobapply_tasks',
    broker=Config.CELERY_BROKER_URL,
    backend=Config.CELERY_RESULT_BACKEND,
    include=['services.notification_service', 'services.video_service']
)

# Configure Celery
app.conf.update(
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    timezone='UTC',
    enable_utc=True,
)

if __name__ == '__main__':
    app.worker_main()