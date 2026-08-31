import { api } from './api';
import type { AuthResponse, User } from '../types';

const TOKEN_KEY = 'audio_player_token';
const USER_KEY = 'audio_player_user';

function saveSession(token: string, username: string): void {
  const cleanToken = token.trim();
  const cleanUsername = username.trim();
  if (!cleanToken) throw new Error('Backend вернул пустой токен');

  localStorage.setItem(TOKEN_KEY, cleanToken);
  localStorage.setItem(USER_KEY, JSON.stringify({ username: cleanUsername } satisfies User));

  // Immediately verify that the browser actually stored the session.
  if (localStorage.getItem(TOKEN_KEY) !== cleanToken) {
    throw new Error('Браузер не смог сохранить токен в Local Storage. Проверь режим приватного просмотра и настройки cookies/site data.');
  }
}

export const authService = {
  async register(username: string, password: string): Promise<AuthResponse> {
    return api.post<AuthResponse>('/register', { username, password });
  },

  async login(username: string, password: string): Promise<AuthResponse> {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    const cleanUsername = username.trim();
    const result = await api.post<AuthResponse>('/login', {
      username: cleanUsername,
      password
    });

    if (!result.token) {
      throw new Error(result.message || 'Backend не вернул токен авторизации');
    }

    saveSession(result.token, result.user?.username ?? cleanUsername);
    return result;
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY)?.trim();
    return token || null;
  },

  getUser(): User | null {
    const value = localStorage.getItem(USER_KEY);
    if (!value) return null;
    try {
      const user = JSON.parse(value) as unknown;
      if (typeof user === 'object' && user !== null && 'username' in user && typeof user.username === 'string') {
        return { username: user.username };
      }
    } catch {
      // Ignore malformed local data.
    }
    return null;
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },

  storageKeys(): { token: string | null; user: User | null } {
    return { token: this.getToken(), user: this.getUser() };
  }
};
