import { api } from './api';
import type { Track } from '../types/track';
export class TrackService {
  public async getTracks(
    token: string,
  ): Promise<Track[]> {
    return api.get<Track[]>(
      '/tracks',
      token,
    );
  }
  public async getFavorites(
    token: string,
  ): Promise<Track[]> {
    return api.get<Track[]>(
      '/favorites',
      token,
    );
  }
  public async addFavorite(
    trackId: string,
    token: string,
  ): Promise<void> {
    await api.post<{
      message: string;
    }>(
      '/favorites',
      {
        trackId,
      },
      token,
    );
  }
  public async removeFavorite(
    trackId: string,
    token: string,
  ): Promise<void> {
    await api.delete<{
      message: string;
    }>(
      '/favorites',
      {
        trackId,
      },
      token,
    );
  }
}