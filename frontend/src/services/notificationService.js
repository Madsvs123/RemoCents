import httpClient from './httpClient';

const NotificationService = {
  getNotifications: async (page = 1, perPage = 20) => {
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('per_page', perPage);
      
      const response = await httpClient.get('/notifications', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  },
  
  markAsRead: async (notificationId) => {
    try {
      const response = await httpClient.post(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
  
  markAllAsRead: async () => {
    try {
      const response = await httpClient.post('/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },
  
  getUnreadCount: async () => {
    try {
      const response = await httpClient.get('/notifications/count');
      return response.data;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  },
  
  // WebSocket connection for real-time notifications
  connectWebSocket: (onNotification) => {
    const socket = new WebSocket(`${process.env.REACT_APP_API_WS_URL}/notifications`);
    
    socket.onopen = () => {
      console.log('WebSocket connected');
      
      // Register user
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.id) {
        socket.send(JSON.stringify({
          action: 'register_user',
          user_id: user.id
        }));
      }
    };
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_notification') {
        onNotification(data);
      }
    };
    
    socket.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    return socket;
  }
};

export default NotificationService;