from elasticsearch import Elasticsearch
from ..config import Config
from ..models.job import Job
from ..models.company import Company
from ..utils.database import db
import json

class SearchService:
    def __init__(self):
        self.es = Elasticsearch(Config.ELASTICSEARCH_URL)
        self._create_indices()
    
    def _create_indices(self):
        # Jobs index
        if not self.es.indices.exists(index='jobs'):
            self.es.indices.create(
                index='jobs',
                body={
                    'mappings': {
                        'properties': {
                            'title': {'type': 'text', 'analyzer': 'english'},
                            'description': {'type': 'text', 'analyzer': 'english'},
                            'skills': {'type': 'keyword'},
                            'location': {'type': 'text'},
                            'company_name': {'type': 'text'},
                            'salary': {'type': 'float'},
                            'created_at': {'type': 'date'},
                            'is_remote': {'type': 'boolean'}
                        }
                    }
                }
            )
        
        # Companies index
        if not self.es.indices.exists(index='companies'):
            self.es.indices.create(
                index='companies',
                body={
                    'mappings': {
                        'properties': {
                            'name': {'type': 'text', 'analyzer': 'english'},
                            'description': {'type': 'text', 'analyzer': 'english'},
                            'industry': {'type': 'keyword'},
                            'location': {'type': 'text'},
                            'size': {'type': 'keyword'}
                        }
                    }
                }
            )
    
    def index_job(self, job_id):
        """Index a job in Elasticsearch"""
        job = Job.query.get(job_id)
        if job:
            doc = {
                'id': str(job.id),
                'title': job.title,
                'description': job.description,
                'skills': [skill.name for skill in job.skills],
                'location': job.location,
                'company_name': job.company.name,
                'salary': job.salary,
                'created_at': job.created_at.isoformat(),
                'is_remote': job.is_remote
            }
            self.es.index(index='jobs', id=job.id, body=doc)
    
    def index_company(self, company_id):
        """Index a company in Elasticsearch"""
        company = Company.query.get(company_id)
        if company:
            doc = {
                'id': str(company.id),
                'name': company.name,
                'description': company.description,
                'industry': company.industry,
                'location': company.location,
                'size': company.size
            }
            self.es.index(index='companies', id=company.id, body=doc)
    
    def search_jobs(self, query, filters=None, page=1, per_page=10):
        """Search jobs with full-text search and filters"""
        if filters is None:
            filters = {}
        
        search_body = {
            'query': {
                'bool': {
                    'must': []
                }
            },
            'highlight': {
                'fields': {
                    'title': {},
                    'description': {}
                }
            },
            'from': (page - 1) * per_page,
            'size': per_page
        }
        
        # Full-text search
        if query:
            search_body['query']['bool']['must'].append({
                'multi_match': {
                    'query': query,
                    'fields': ['title^3', 'description', 'skills^2', 'company_name'],
                    'fuzziness': 'AUTO'
                }
            })
        
        # Filters
        for field, value in filters.items():
            if field == 'skills':
                search_body['query']['bool']['must'].append({
                    'terms': {'skills': value}
                })
            elif field == 'location':
                search_body['query']['bool']['must'].append({
                    'match': {'location': value}
                })
            elif field == 'salary_min':
                search_body['query']['bool']['must'].append({
                    'range': {'salary': {'gte': float(value)}}
                })
            elif field == 'is_remote':
                search_body['query']['bool']['must'].append({
                    'term': {'is_remote': bool(value)}
                })
        
        result = self.es.search(index='jobs', body=search_body)
        
        # Get job IDs from search results
        job_ids = [hit['_source']['id'] for hit in result['hits']['hits']]
        jobs = Job.query.filter(Job.id.in_(job_ids)).all()
        
        # Preserve order from Elasticsearch
        job_id_to_index = {job_id: idx for idx, job_id in enumerate(job_ids)}
        jobs.sort(key=lambda x: job_id_to_index[str(x.id)])
        
        return {
            'jobs': jobs,
            'total': result['hits']['total']['value'],
            'page': page,
            'per_page': per_page,
            'highlights': {hit['_id']: hit.get('highlight', {}) for hit in result['hits']['hits']}
        }
    
    def search_companies(self, query, page=1, per_page=10):
        """Search companies"""
        search_body = {
            'query': {
                'multi_match': {
                    'query': query,
                    'fields': ['name^2', 'description', 'industry'],
                    'fuzziness': 'AUTO'
                }
            },
            'from': (page - 1) * per_page,
            'size': per_page
        }
        
        result = self.es.search(index='companies', body=search_body)
        company_ids = [hit['_source']['id'] for hit in result['hits']['hits']]
        companies = Company.query.filter(Company.id.in_(company_ids)).all()
        
        return {
            'companies': companies,
            'total': result['hits']['total']['value'],
            'page': page,
            'per_page': per_page
        }
    
    def suggest_skills(self, query, size=5):
        """Get skill suggestions"""
        result = self.es.search(
            index='jobs',
            body={
                'suggest': {
                    'skill_suggest': {
                        'text': query,
                        'term': {
                            'field': 'skills'
                        }
                    }
                }
            }
        )
        
        suggestions = []
        if 'skill_suggest' in result['suggest']:
            for suggest in result['suggest']['skill_suggest']:
                for option in suggest['options']:
                    suggestions.append(option['text'])
        
        return suggestions[:size]
