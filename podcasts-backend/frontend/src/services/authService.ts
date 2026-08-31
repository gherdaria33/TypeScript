import { api } from './api';
import type { AuthResponse, User } from '../types';

const TOKEN_KEY = 'audio_player_token';
const USER_KEY = 'audio_player_user';

export const authService = {
  async register(username: string, password: string): Promise<AuthResponse> {
    return api.post<AuthResponse>('/register', { username, password });
  },

  async login(username: string, password: string): Promise<AuthResponse> {
    // Remove an old token before a new login, so a stale token can never be reused.
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    const result = await api.post<AuthResponse>('/login', {
      username,
      password
    });

    if (!result.token) throw new Error('Сервер не вернул токен авторизации');

    localStorage.setItem(TOKEN_KEY, result.token);
    localStorage.setItem(USER_KEY, JSON.stringify(result.user ?? { username }));
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
