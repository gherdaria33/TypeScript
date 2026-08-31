export interface Track {
  id: number;
  title: string;
  artist: string;
  album?: string;
  date?: string;
  duration?: number;
  size_mb?: number;
  encoded_audio?: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: {
    username: string;
  };
}

export interface User {
  username: string;
}