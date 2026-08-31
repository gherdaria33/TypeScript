const API_BASE = "http://localhost:8000/api";

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error("Не удалось подключиться к backend. Проверь http://localhost:8000/api/health");
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try { data = JSON.parse(text) as unknown; }
    catch { data = { message: text }; }
  }

  if (!response.ok) {
    const message = typeof data === "object" && data !== null && "message" in data && typeof data.message === "string"
      ? data.message : `Ошибка HTTP ${response.status}`;
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string, token?: string) => request<T>(path, { method: "GET" }, token),
  post: <T>(path: string, body: unknown, token?: string) => request<T>(path, { method: "POST", body: JSON.stringify(body) }, token),
  delete: <T>(path: string, body: unknown, token?: string) => request<T>(path, { method: "DELETE", body: JSON.stringify(body) }, token),
};
