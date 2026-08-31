import { api } from './api';
import type { Track } from '../types';
import { authService } from './authService';

export const favoriteService = {
  async getFavorites(): Promise<Track[]> {
    const token =
      authService.getToken();

    if (!token) {
      throw new Error(
        'Необходима авторизация'
      );
    }

    return api.get<Track[]>(
      '/favorites',
      token
    );
  },

  async add(
    trackId: number
  ): Promise<void> {
    const token =
      authService.getToken();

    if (!token) {
      throw new Error(
        'Необходима авторизация'
      );
    }

    await api.post(
      '/favorites',
      {
        trackId,
      },
      token
    );
  },

  async remove(
    trackId: number
  ): Promise<void> {
    const token =
      authService.getToken();

    if (!token) {
      throw new Error(
        'Необходима авторизация'
      );
    }

    await api.delete(
      '/favorites',
      {
        trackId,
      },
      token
    );
  },
};