export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  date?: string;
  createdAt?: string;
  audioUrl?: string;
  url?: string;
  src?: string;
  duration?: number;
}