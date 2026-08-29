import { api } from './api';
import { LocalStorageClass } from './localStorageClass';
interface AuthResponse {
  message: string;
  token?: string;
  user?: {
    username: string;
  };
}
export class AuthService {
  private readonly storage: LocalStorageClass;
  public constructor() {
    this.storage =
      new LocalStorageClass();
  }
  public async login(
    username: string,
    password: string,
  ): Promise<string> {
    const response =
      await api.post<AuthResponse>(
        '/login',
        {
          username:
            username.trim(),
          password,
        },
      );
    if (!response.token) {
      throw new Error(
        'Сервер не вернул токен авторизации',
      );
    }
    this.storage.setToken(
      response.token,
    );
    this.storage.setUsername(
      username.trim(),
    );
    return response.token;
  }
  public async register(
    username: string,
    password: string,
  ): Promise<void> {
    await api.post<AuthResponse>(
      '/register',
      {
        username:
          username.trim(),
        password,
      },
    );
  }
  public logout(): void {
    this.storage.removeToken();
    this.storage.removeUsername();
  }
  public isAuthenticated(): boolean {
    return Boolean(
      this.storage.getToken(),
    );
  }
  public getToken(): string | null {
    return this.storage.getToken();
  }
  public getUsername(): string | null {
    return this.storage.getUsername();
  }
}