import axios from 'axios';
import { BASE_API_URL } from '../apiConfig';

class MessageService {
  constructor() {
    this.baseURL = BASE_API_URL;
  }

  // Get latest messages for current user
  async getLatestMessages() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${this.baseURL}/api/v1/messages/latest`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching latest messages:', error);
      
      // Check if we have real-time messages stored locally first
      const storedMessages = this.getStoredMessages();
      if (storedMessages.length > 0) {
        console.log('📦 Using stored real-time messages instead of dummy data');
        return {
          success: true,
          messages: storedMessages
        };
      }
      
      // Only return empty array if API fails and no stored messages
      // This prevents dummy data from overriding real socket messages
      console.log('⚠️ API failed and no stored messages, returning empty array');
      return {
        success: true,
        messages: []
      };
    }
  }

  // Store real-time messages locally
  storeMessage(messageData) {
    try {
      const stored = JSON.parse(localStorage.getItem('realTimeMessages') || '[]');
      const newMessage = {
        ...messageData,
        _id: messageData._id || Date.now().toString(),
        timestamp: messageData.timestamp || new Date().toISOString()
      };
      
      // Add to beginning and keep only last 20 messages
      const updated = [newMessage, ...stored.slice(0, 19)];
      localStorage.setItem('realTimeMessages', JSON.stringify(updated));
      
      console.log('💾 Stored real-time message:', newMessage);
      return true;
    } catch (error) {
      console.error('Error storing message:', error);
      return false;
    }
  }

  // Get stored real-time messages
  getStoredMessages() {
    try {
      const stored = JSON.parse(localStorage.getItem('realTimeMessages') || '[]');
      return stored.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    } catch (error) {
      console.error('Error getting stored messages:', error);
      return [];
    }
  }

  // Clear stored messages
  clearStoredMessages() {
    try {
      localStorage.removeItem('realTimeMessages');
      console.log('🧹 Cleared stored messages');
      return true;
    } catch (error) {
      console.error('Error clearing stored messages:', error);
      return false;
    }
  }

  // Mark message as read
  async markMessageAsRead(messageId) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${this.baseURL}/api/v1/messages/${messageId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return { success: false, error: error.message };
    }
  }

  // Get message notifications count
  async getUnreadCount() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${this.baseURL}/api/v1/messages/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return { success: true, count: 0 };
    }
  }
}

export default new MessageService();