import { Chat, Message, User, UserSettings } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://reyan-backend.onrender.com';

export const formatMediaUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('http://localhost:8085')) {
    url = url.replace('http://localhost:8085', API_BASE_URL);
  }
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

class ApiService {
  private getHeaders(isMultipart = false): HeadersInit {
    const headers: Record<string, string> = {};
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    const token = localStorage.getItem('reyan_access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Handle token expiration or invalid user state
        localStorage.removeItem('reyan_access_token');
        localStorage.removeItem('reyan_refresh_token');
        window.dispatchEvent(new Event('reyan_auth_error'));
      }
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'API Request failed');
    }
    if (response.status === 24 || response.status === 205) {
      return {} as T;
    }
    return response.json();
  }

  // Auth APIs
  async login(usernameOrEmail: string, password: String): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernameOrEmail, password })
    });
    return this.handleResponse(res);
  }

  async register(data: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return this.handleResponse(res);
  }

  async refreshToken(refreshToken: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    return this.handleResponse(res);
  }

  async logout(refreshToken?: string): Promise<void> {
    await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ refreshToken })
    });
  }

  // User APIs
  async getCurrentUser(): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<User>(res);
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<User>(res);
  }

  async searchUsers(query: string): Promise<User[]> {
    const res = await fetch(`${API_BASE_URL}/api/v1/users/search?query=${encodeURIComponent(query)}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<User[]>(res);
  }

  // Chat APIs
  async getChats(): Promise<Chat[]> {
    const res = await fetch(`${API_BASE_URL}/api/v1/chats`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<Chat[]>(res);
  }

  async createDirectChat(recipientId: string): Promise<Chat> {
    const res = await fetch(`${API_BASE_URL}/api/v1/chats/direct`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ recipientId })
    });
    return this.handleResponse<Chat>(res);
  }

  async createGroupChat(name: string, memberIds: string[], description?: string): Promise<Chat> {
    const res = await fetch(`${API_BASE_URL}/api/v1/chats/group`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ name, memberIds, description })
    });
    return this.handleResponse<Chat>(res);
  }

  async togglePinChat(chatId: string): Promise<void> {
    await fetch(`${API_BASE_URL}/api/v1/chats/${chatId}/pin`, {
      method: 'PUT',
      headers: this.getHeaders()
    });
  }

  async toggleMuteChat(chatId: string): Promise<void> {
    await fetch(`${API_BASE_URL}/api/v1/chats/${chatId}/mute`, {
      method: 'PUT',
      headers: this.getHeaders()
    });
  }

  // Message APIs
  async getChatMessages(chatId: string): Promise<Message[]> {
    const res = await fetch(`${API_BASE_URL}/api/v1/messages/chat/${chatId}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<Message[]>(res);
  }

  async sendMessage(data: {
    chatId: string;
    content?: string;
    messageType?: string;
    mediaUrl?: string;
    replyToMessageId?: string;
    clientMessageId?: string;
  }): Promise<Message> {
    const res = await fetch(`${API_BASE_URL}/api/v1/messages`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<Message>(res);
  }

  async editMessage(messageId: string, content: string): Promise<Message> {
    const res = await fetch(`${API_BASE_URL}/api/v1/messages/${messageId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ content })
    });
    return this.handleResponse<Message>(res);
  }

  async deleteMessageForEveryone(messageId: string): Promise<void> {
    await fetch(`${API_BASE_URL}/api/v1/messages/${messageId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
  }

  async markAsRead(chatId: string): Promise<void> {
    await fetch(`${API_BASE_URL}/api/v1/messages/chat/${chatId}/read`, {
      method: 'POST',
      headers: this.getHeaders()
    });
  }

  async starMessage(messageId: string): Promise<void> {
    await fetch(`${API_BASE_URL}/api/v1/messages/${messageId}/star`, {
      method: 'POST',
      headers: this.getHeaders()
    });
  }

  async unstarMessage(messageId: string): Promise<void> {
    await fetch(`${API_BASE_URL}/api/v1/messages/${messageId}/star`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
  }

  // Media API
  async uploadMedia(file: File, folder = 'chat-media'): Promise<{ mediaUrl: string; filename: string; fileSize: number }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await fetch(`${API_BASE_URL}/api/v1/media/upload`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: formData
    });
    return this.handleResponse(res);
  }

  // Settings API
  async getSettings(): Promise<UserSettings> {
    const res = await fetch(`${API_BASE_URL}/api/v1/settings`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<UserSettings>(res);
  }

  async updateSettings(data: Partial<UserSettings>): Promise<UserSettings> {
    const res = await fetch(`${API_BASE_URL}/api/v1/settings`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<UserSettings>(res);
  }

  async updatePresenceStatus(isOnline: boolean): Promise<void> {
    await fetch(`${API_BASE_URL}/api/v1/users/presence`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ isOnline })
    }).catch(() => {});
  }

  // Block API
  async getBlockedUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE_URL}/api/v1/blocks`, {
      headers: this.getHeaders()
    });
    return this.handleResponse<User[]>(res);
  }

  async blockUser(userId: string): Promise<void> {
    await fetch(`${API_BASE_URL}/api/v1/blocks/${userId}`, {
      method: 'POST',
      headers: this.getHeaders()
    });
  }

  async unblockUser(userId: string): Promise<void> {
    await fetch(`${API_BASE_URL}/api/v1/blocks/${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
  }
}

export const api = new ApiService();
