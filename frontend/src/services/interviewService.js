import httpClient from './httpClient';

const InterviewService = {
  scheduleInterview: async (interviewData) => {
    try {
      const response = await httpClient.post('/interviews', interviewData);
      return response.data;
    } catch (error) {
      console.error('Error scheduling interview:', error);
      throw error;
    }
  },
  
  getInterview: async (interviewId) => {
    try {
      const response = await httpClient.get(`/interviews/${interviewId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting interview:', error);
      throw error;
    }
  },
  
  getApplicationInterviews: async (applicationId) => {
    try {
      const response = await httpClient.get(`/interviews/application/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting application interviews:', error);
      throw error;
    }
  },
  
  getUserInterviews: async () => {
    try {
      const response = await httpClient.get('/interviews/user');
      return response.data;
    } catch (error) {
      console.error('Error getting user interviews:', error);
      throw error;
    }
  },
  
  updateInterviewStatus: async (interviewId, status) => {
    try {
      const response = await httpClient.put(`/interviews/${interviewId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating interview status:', error);
      throw error;
    }
  },
  
  getUpcomingInterviews: async () => {
    try {
      const response = await httpClient.get('/interviews/upcoming');
      return response.data;
    } catch (error) {
      console.error('Error getting upcoming interviews:', error);
      throw error;
    }
  }
};

export default InterviewService;