import httpClient from './httpClient';

const VideoService = {
  uploadVideoResume: async (file, applicationId = null) => {
    try {
      const formData = new FormData();
      formData.append('video', file);
      
      if (applicationId) {
        formData.append('application_id', applicationId);
      }
      
      const response = await httpClient.post('/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading video resume:', error);
      throw error;
    }
  },
  
  getVideoResume: async (videoId) => {
    try {
      const response = await httpClient.get(`/videos/${videoId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting video resume:', error);
      throw error;
    }
  },
  
  getUserVideoResumes: async () => {
    try {
      const response = await httpClient.get('/videos/user');
      return response.data;
    } catch (error) {
      console.error('Error getting user video resumes:', error);
      throw error;
    }
  },
  
  deleteVideoResume: async (videoId) => {
    try {
      const response = await httpClient.delete(`/videos/${videoId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting video resume:', error);
      throw error;
    }
  },
  
  getVideoStatus: async (videoId) => {
    try {
      const response = await httpClient.get(`/videos/${videoId}/status`);
      return response.data;
    } catch (error) {
      console.error('Error getting video status:', error);
      throw error;
    }
  }
};

export default VideoService;