import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app
from PIL import Image
import PyPDF2
import docx


def allowed_file(filename):
    """Check if file has allowed extension."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']


def generate_unique_filename(filename):
    """Generate a unique filename to prevent conflicts."""
    ext = filename.rsplit('.', 1)[1].lower()
    unique_id = uuid.uuid4().hex
    return f"{unique_id}.{ext}"


def save_file(file, subfolder=None):
    """Save uploaded file to the uploads directory."""
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_filename = generate_unique_filename(filename)
        
        # Create subfolder if specified
        upload_path = current_app.config['UPLOAD_FOLDER']
        if subfolder:
            upload_path = os.path.join(upload_path, subfolder)
            if not os.path.exists(upload_path):
                os.makedirs(upload_path)
        
        file_path = os.path.join(upload_path, unique_filename)
        file.save(file_path)
        
        return unique_filename
    
    return None


def save_profile_picture(file, user_id):
    """Save and process profile picture."""
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_filename = generate_unique_filename(filename)
        
        # Create user-specific folder
        upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'profile_pictures')
        if not os.path.exists(upload_path):
            os.makedirs(upload_path)
        
        file_path = os.path.join(upload_path, unique_filename)
        file.save(file_path)
        
        # Resize image if it's a picture
        if filename.rsplit('.', 1)[1].lower() in ['jpg', 'jpeg', 'png']:
            resize_image(file_path, (300, 300))
        
        return unique_filename
    
    return None


def resize_image(file_path, size):
    """Resize image to specified size."""
    try:
        with Image.open(file_path) as img:
            img.thumbnail(size)
            img.save(file_path)
    except Exception as e:
        current_app.logger.error(f'Error resizing image: {str(e)}')


def extract_text_from_pdf(file_path):
    """Extract text from PDF file."""
    try:
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ''
            for page in reader.pages:
                text += page.extract_text()
            return text
    except Exception as e:
        current_app.logger.error(f'Error extracting text from PDF: {str(e)}')
        return None


def extract_text_from_docx(file_path):
    """Extract text from DOCX file."""
    try:
        doc = docx.Document(file_path)
        return '\n'.join([para.text for para in doc.paragraphs])
    except Exception as e:
        current_app.logger.error(f'Error extracting text from DOCX: {str(e)}')
        return None


def delete_file(filename, subfolder=None):
    """Delete a file from the uploads directory."""
    try:
        upload_path = current_app.config['UPLOAD_FOLDER']
        if subfolder:
            upload_path = os.path.join(upload_path, subfolder)
        
        file_path = os.path.join(upload_path, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except Exception as e:
        current_app.logger.error(f'Error deleting file: {str(e)}')
    
    return False