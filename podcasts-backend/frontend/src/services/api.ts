const API_BASE_URL =
  'http://localhost:8000/api';
interface ApiErrorResponse {
  message?: string;
}
export class ApiError extends Error {
  public readonly status: number;
  public constructor(
    message: string,
    status: number,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
export class Api {
  private readonly baseUrl: string;
  public constructor(
    baseUrl: string = API_BASE_URL,
  ) {
    this.baseUrl =
      baseUrl.replace(/\/$/, '');
  }
  public async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers =
      new Headers(
        options.headers,
      );
    headers.set(
      'Content-Type',
      'application/json',
    );
    const response =
      await fetch(
        `${this.baseUrl}${endpoint}`,
        {
          ...options,
          headers,
        },
      );
    const text =
      await response.text();
    let data: unknown = null;
    if (text) {
      try {
        data =
          JSON.parse(text);
      } catch {
        data = text;
      }
    }
    if (!response.ok) {
      let message =
        `Ошибка сервера: ${response.status}`;
      if (
        typeof data === 'object' &&
        data !== null &&
        'message' in data
      ) {
        const errorData =
          data as ApiErrorResponse;
        if (
          typeof errorData.message ===
          'string'
        ) {
          message =
            errorData.message;
        }
      }
      throw new ApiError(
        message,
        response.status,
      );
    }
    return data as T;
  }
  public async get<T>(
    endpoint: string,
    token?: string,
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'GET',
        headers:
          this.createAuthHeaders(
            token,
          ),
      },
    );
  }
  public async post<T>(
    endpoint: string,
    body: unknown,
    token?: string,
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        headers:
          this.createAuthHeaders(
            token,
          ),
        body: JSON.stringify(
          body,
        ),
      },
    );
  }
  public async delete<T>(
    endpoint: string,
    body: unknown,
    token?: string,
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'DELETE',
        headers:
          this.createAuthHeaders(
            token,
          ),
        body: JSON.stringify(
          body,
        ),
      },
    );
  }
  private createAuthHeaders(
    token?: string,
  ): HeadersInit {
    if (!token) {
      return {};
    }
    return {
      Authorization:
        `Bearer ${token}`,
    };
  }
}
export const api =
  new Api();