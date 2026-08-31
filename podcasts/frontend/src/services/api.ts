const API_BASE = '/api';
async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  // Передаём JWT токен
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        message: text,
      };
    }
  }
  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof data.message === 'string'
        ? data.message
        : `Ошибка HTTP ${response.status}`;
    throw new Error(message);
  }
  return data as T;
}
export const api = {
  get<T>(
    path: string,
    token?: string
  ): Promise<T> {
    return request<T>(
      path,
      {
        method: 'GET',
      },
      token
    );
  },
  post<T>(
    path: string,
    body: unknown,
    token?: string
  ): Promise<T> {
    return request<T>(
      path,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      token
    );
  },
  delete<T>(
    path: string,
    body: unknown,
    token?: string
  ): Promise<T> {
    return request<T>(
      path,
      {
        method: 'DELETE',
        body: JSON.stringify(body),
      },
      token
    );
  },
};