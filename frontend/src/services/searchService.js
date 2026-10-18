import httpClient from './httpClient';

const SearchService = {
  searchJobs: async (query, filters = {}, page = 1, perPage = 10) => {
    try {
      const params = new URLSearchParams();
      
      if (query) params.append('q', query);
      params.append('page', page);
      params.append('per_page', perPage);
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });
      
      const response = await httpClient.get('/search/jobs', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  },
  
  searchCompanies: async (query, page = 1, perPage = 10) => {
    try {
      const params = new URLSearchParams();
      
      if (query) params.append('q', query);
      params.append('page', page);
      params.append('per_page', perPage);
      
      const response = await httpClient.get('/search/companies', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching companies:', error);
      throw error;
    }
  },
  
  suggestSkills: async (query, size = 5) => {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      params.append('size', size);
      
      const response = await httpClient.get('/search/skills/suggest', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting skill suggestions:', error);
      throw error;
    }
  }
};

export default SearchService;