// API service for IFlyChat backend integration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to make requests with credentials
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      credentials: 'include', // Include cookies for session management
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/users/me');
  }

  // Chat endpoints
  async getChats() {
    return this.request('/chats');
  }

  async createChat(chatData) {
    return this.request('/chats', {
      method: 'POST',
      body: JSON.stringify(chatData),
    });
  }

  async getChat(chatId) {
    return this.request(`/chats/${chatId}`);
  }

  async getChatMessages(chatId, limit = 100, offset = 0) {
    return this.request(`/chats/${chatId}/messages?limit=${limit}&offset=${offset}`);
  }

  async sendMessage(chatId, messageData) {
    return this.request(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async sendMessageStream(chatId, messageData, onData) {
    const url = `${this.baseURL}/chats/${chatId}/messages/stream`;
    const config = {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              onData(data);
            } catch (e) {
              console.warn('Failed to parse SSE data:', line);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Streaming API request failed: /chats/${chatId}/messages/stream`, error);
      throw error;
    }
  }

  async deleteChat(chatId) {
    return this.request(`/chats/${chatId}`, {
      method: 'DELETE',
    });
  }

  // File endpoints
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/files/upload', {
      method: 'POST',
      headers: {}, // Remove Content-Type header to let browser set it for FormData
      body: formData,
    });
  }

  async getUserFiles(limit = 50, offset = 0) {
    return this.request(`/files?limit=${limit}&offset=${offset}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Chat name generation
  async generateChatName(chatId, nameData) {
    return this.request(`/chats/${chatId}/name`, {
      method: 'POST',
      body: JSON.stringify(nameData),
    });
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;

// Helper function for handling API errors
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.message.includes('401')) {
    // Handle unauthorized - redirect to login or clear session
    localStorage.removeItem('indifly_user');
    window.location.href = '/login';
    return;
  }
  
  if (error.message.includes('403')) {
    return 'Access denied. Please check your permissions.';
  }
  
  if (error.message.includes('404')) {
    return 'Resource not found.';
  }
  
  if (error.message.includes('500')) {
    return 'Server error. Please try again later.';
  }
  
  return error.message || 'An unexpected error occurred.';
};

// Auth context helper functions
export const authHelpers = {
  async checkAuth() {
    try {
      const user = await apiService.getCurrentUser();
      return { success: true, user };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  async loginUser(credentials) {
    try {
      const response = await apiService.login(credentials);
      if (response.success) {
        return { success: true, user: response.user };
      }
      throw new Error(response.message || 'Login failed');
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  async registerUser(userData) {
    try {
      const response = await apiService.register(userData);
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  },

  async logoutUser() {
    try {
      await apiService.logout();
      localStorage.removeItem('indifly_user');
      return { success: true };
    } catch (error) {
      return { success: false, error: handleApiError(error) };
    }
  }
};
