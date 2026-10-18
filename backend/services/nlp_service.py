import spacy
import nltk
from textblob import TextBlob
from collections import Counter
import re
import os

# Download NLTK data (only once)
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('averaged_perceptron_tagger', quiet=True)

try:
    nlp = spacy.load('en_core_web_sm')
except OSError:
    # Download spaCy model if not available
    import subprocess
    subprocess.run(['python', '-m', 'spacy', 'download', 'en_core_web_sm'], check=True)
    nlp = spacy.load('en_core_web_sm')

class NLPService:
    def __init__(self):
        self.stop_words = set(nltk.corpus.stopwords.words('english'))
    
    def extract_text_from_resume(self, file_path):
        """Extract text from resume file (PDF, DOCX, or TXT)"""
        import PyPDF2
        from docx import Document
        
        ext = os.path.splitext(file_path)[1].lower()
        text = ""
        
        try:
            if ext == '.pdf':
                with open(file_path, 'rb') as file:
                    reader = PyPDF2.PdfReader(file)
                    for page in reader.pages:
                        text += page.extract_text()
            
            elif ext in ['.docx', '.doc']:
                doc = Document(file_path)
                for para in doc.paragraphs:
                    text += para.text + '\n'
            
            elif ext == '.txt':
                with open(file_path, 'r', encoding='utf-8') as file:
                    text = file.read()
            
            else:
                raise ValueError("Unsupported file format")
                
            return self.clean_text(text)
            
        except Exception as e:
            raise ValueError(f"Error extracting text: {str(e)}")
    
    def clean_text(self, text):
        """Clean and normalize text"""
        # Remove special characters and extra whitespace
        text = re.sub(r'[^\w\s.,;:!?-]', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    
    def extract_skills(self, text, job_description=None):
        """Extract skills from text using NLP"""
        # Basic skill extraction - would be enhanced with a skills database
        doc = nlp(text)
        
        # Common skill keywords
        skill_keywords = [
            'python', 'java', 'javascript', 'c++', 'sql', 'html', 'css',
            'react', 'angular', 'vue', 'node', 'django', 'flask', 'spring',
            'aws', 'azure', 'docker', 'kubernetes', 'git', 'linux',
            'machine learning', 'deep learning', 'data science', 'devops',
            'agile', 'scrum', 'project management', 'leadership'
        ]
        
        # Extract nouns and noun phrases
        skills = set()
        for token in doc:
            if token.text.lower() in skill_keywords:
                skills.add(token.text.lower())
        
        # Extract noun chunks
        for chunk in doc.noun_chunks:
            chunk_text = chunk.text.lower()
            if len(chunk_text.split()) <= 3:  # Limit to 3 words
                if any(skill in chunk_text for skill in skill_keywords):
                    skills.add(chunk_text)
        
        # Match against job description if provided
        if job_description:
            job_doc = nlp(job_description)
            job_skills = self.extract_skills(job_description)
            # Prioritize skills mentioned in job description
            matched_skills = skills.intersection(job_skills)
            if matched_skills:
                skills = matched_skills.union(skills - matched_skills)
        
        return list(skills)[:20]  # Return top 20 skills
    
    def calculate_match_score(self, resume_text, job_description):
        """Calculate match score between resume and job description"""
        resume_skills = self.extract_skills(resume_text)
        job_skills = self.extract_skills(job_description)
        
        if not job_skills:
            return 0
        
        # Simple matching score
        matched_skills = set(resume_skills).intersection(set(job_skills))
        score = (len(matched_skills) / len(job_skills)) * 100
        
        # Add sentiment analysis
        resume_sentiment = TextBlob(resume_text).sentiment.polarity
        job_sentiment = TextBlob(job_description).sentiment.polarity
        
        # Sentiment similarity (0-1)
        sentiment_score = 1 - abs(resume_sentiment - job_sentiment)
        
        # Combined score
        final_score = (score * 0.8) + (sentiment_score * 20)
        
        return min(100, max(0, final_score))
    
    def analyze_sentiment(self, text):
        """Analyze sentiment of text"""
        blob = TextBlob(text)
        return {
            'polarity': blob.sentiment.polarity,
            'subjectivity': blob.sentiment.subjectivity,
            'sentiment': self._get_sentiment_label(blob.sentiment.polarity)
        }
    
    def _get_sentiment_label(self, polarity):
        if polarity > 0.1:
            return 'positive'
        elif polarity < -0.1:
            return 'negative'
        else:
            return 'neutral'
    
    def extract_keywords(self, text, top_n=10):
        """Extract top keywords from text"""
        # Remove stopwords and tokenize
        words = nltk.word_tokenize(text.lower())
        words = [word for word in words if word.isalnum() and word not in self.stop_words]
        
        # Count word frequencies
        word_freq = Counter(words)
        
        # Get top N keywords
        return [word for word, freq in word_freq.most_common(top_n)]
    
    def extract_entities(self, text):
        """Extract named entities from text"""
        doc = nlp(text)
        entities = []
        
        for ent in doc.ents:
            entities.append({
                'text': ent.text,
                'label': ent.label_,
                'label_description': self._get_entity_description(ent.label_)
            })
        
        return entities
    
    def _get_entity_description(self, label):
        entity_map = {
            'PERSON': 'Person',
            'ORG': 'Organization',
            'GPE': 'Geopolitical Entity',
            'DATE': 'Date',
            'TIME': 'Time',
            'MONEY': 'Monetary Value',
            'PERCENT': 'Percentage',
            'LOC': 'Location',
            'PRODUCT': 'Product',
            'EVENT': 'Event',
            'WORK_OF_ART': 'Work of Art',
            'LAW': 'Law',
            'LANGUAGE': 'Language'
        }
        return entity_map.get(label, label)
    
    def generate_summary(self, text, ratio=0.2):
        """Generate summary of text"""
        from sumy.parsers.plaintext import PlaintextParser
        from sumy.nlp.tokenizers import Tokenizer
        from sumy.summarizers.lsa import LsaSummarizer
        
        parser = PlaintextParser.from_string(text, Tokenizer("english"))
        summarizer = LsaSummarizer()
        summary = summarizer(parser.document, sentences_count=5)
        
        return " ".join([str(sentence) for sentence in summary])
    
    def analyze_resume(self, file_path):
        """Comprehensive resume analysis"""
        text = self.extract_text_from_resume(file_path)
        
        return {
            'text_length': len(text),
            'word_count': len(text.split()),
            'skills': self.extract_skills(text),
            'keywords': self.extract_keywords(text),
            'entities': self.extract_entities(text),
            'sentiment': self.analyze_sentiment(text),
            'summary': self.generate_summary(text)
        }
