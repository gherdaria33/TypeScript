const API_BASE = '/api';

const TOKEN_KEY = 'audio_player_token';

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(
    options.headers
  );

  headers.set(
    'Content-Type',
    'application/json'
  );

  // Берём актуальный JWT автоматически
  const token =
    localStorage.getItem(TOKEN_KEY);

  if (token) {
    headers.set(
      'Authorization',
      `Bearer ${token}`
    );
  }

  const response = await fetch(
    `${API_BASE}${path}`,
    {
      ...options,
      headers,
    }
  );

  const text =
    await response.text();

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
    let message =
      `Ошибка HTTP ${response.status}`;

    if (
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof data.message === 'string'
    ) {
      message = data.message;
    }

    // JWT больше не действителен
    if (response.status === 401) {
      localStorage.removeItem(
        TOKEN_KEY
      );

      localStorage.removeItem(
        'audio_player_user'
      );
    }

    throw new Error(message);
  }

  return data as T;
}

export const api = {
  get<T>(
    path: string
  ): Promise<T> {
    return request<T>(
      path,
      {
        method: 'GET',
      }
    );
  },

  post<T>(
    path: string,
    body: unknown
  ): Promise<T> {
    return request<T>(
      path,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  },

  delete<T>(
    path: string,
    body?: unknown
  ): Promise<T> {
    return request<T>(
      path,
      {
        method: 'DELETE',
        ...(body !== undefined
          ? {
              body: JSON.stringify(body),
            }
          : {}),
      }
    );
  },
};