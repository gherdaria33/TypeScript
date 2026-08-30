import { api } from './api';

export interface User {
  id?: number | string;
  name?: string;
  username?: string;
  email: string;
  password?: string;
}

const USER_KEY = 'user';
const TOKEN_KEY = 'token';

class AuthService {
  getCurrentUser(): User | null {
    const rawUser =
      localStorage.getItem(USER_KEY);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as User;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  async login(
    email: string,
    password: string,
  ): Promise<User> {
    const response =
      await api.login(
        email,
        password,
      );

    const data =
      response as Record<
        string,
        unknown
      >;

    const token =
      typeof data.token === 'string'
        ? data.token
        : typeof data.accessToken ===
            'string'
          ? data.accessToken
          : 'authenticated';

    const user =
      this.extractUser(data, email);

    localStorage.setItem(
      TOKEN_KEY,
      token,
    );

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(user),
    );

    return user;
  }

  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<User> {
    const response =
      await api.register(
        name,
        email,
        password,
      );

    const data =
      response as Record<
        string,
        unknown
      >;

    const token =
      typeof data.token === 'string'
        ? data.token
        : typeof data.accessToken ===
            'string'
          ? data.accessToken
          : 'authenticated';

    const user =
      this.extractUser(data, email);

    user.name = name;

    localStorage.setItem(
      TOKEN_KEY,
      token,
    );

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(user),
    );

    return user;
  }

  logout(): void {
    localStorage.removeItem(
      TOKEN_KEY,
    );

    localStorage.removeItem(
      USER_KEY,
    );

    localStorage.removeItem(
      'userPassword',
    );
  }

  async updateProfile(
    data: {
      name: string;
      email: string;
      password?: string;
    },
  ): Promise<User> {
    const currentUser =
      this.getCurrentUser();

    if (!currentUser) {
      throw new Error(
        'Пользователь не авторизован.',
      );
    }

    /*
     * Если api.updateProfile существует,
     * используем настоящий backend.
     */

    const apiObject =
      api as unknown as Record<
        string,
        unknown
      >;

    const updateProfile =
      apiObject['updateProfile'];

    if (
      typeof updateProfile ===
      'function'
    ) {
      const response =
        await (
          updateProfile as (
            data: {
              name: string;
              email: string;
              password?: string;
            },
          ) => Promise<unknown>
        ).call(
          api,
          data,
        );

      const updatedUser =
        this.extractUser(
          response as Record<
            string,
            unknown
          >,
          data.email,
        );

      updatedUser.name =
        data.name;

      localStorage.setItem(
        USER_KEY,
        JSON.stringify(
          updatedUser,
        ),
      );

      return updatedUser;
    }

    /*
     * Временный fallback для backend,
     * где endpoint изменения профиля
     * пока отсутствует.
     */

    const updatedUser: User = {
      ...currentUser,
      name: data.name,
      email: data.email,
    };

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(
        updatedUser,
      ),
    );

    if (data.password) {
      localStorage.setItem(
        'userPassword',
        data.password,
      );
    }

    return updatedUser;
  }

  private extractUser(
    data: Record<
      string,
      unknown
    >,
    email: string,
  ): User {
    const possibleUser =
      data.user;

    if (
      typeof possibleUser ===
        'object' &&
      possibleUser !== null
    ) {
      return {
        ...(possibleUser as User),
        email:
          typeof (
            possibleUser as User
          ).email === 'string'
            ? (
                possibleUser as User
              ).email
            : email,
      };
    }

    return {
      id:
        typeof data.id ===
        'string' ||
        typeof data.id ===
          'number'
          ? data.id
          : undefined,

      name:
        typeof data.name ===
        'string'
          ? data.name
          : undefined,

      username:
        typeof data.username ===
        'string'
          ? data.username
          : undefined,

      email:
        typeof data.email ===
        'string'
          ? data.email
          : email,
    };
  }
}

export const authService =
  new AuthService();