import { api } from './api';
import type { AuthResponse, User } from '../types';

const TOKEN_KEY = 'audio_player_token';
const USER_KEY = 'audio_player_user';

export const authService = {
  async register(username: string, password: string): Promise<AuthResponse> {
    return api.post<AuthResponse>('/register', { username, password });
  },

  async login(username: string, password: string): Promise<AuthResponse> {
    const result = await api.post<AuthResponse>('/login', { username, password });
    if (result.token) {
      localStorage.setItem(TOKEN_KEY, result.token);
      localStorage.setItem(USER_KEY, JSON.stringify({ username }));
    }
    return result;
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): User | null {
    const value = localStorage.getItem(USER_KEY);
    if (!value) return null;
    try {
      return JSON.parse(value) as User;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }
};