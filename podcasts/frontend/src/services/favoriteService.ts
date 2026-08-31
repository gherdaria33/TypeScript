import { api } from './api';
import { authService } from './authService';
import type { Track } from '../types';

export const favoriteService = {

  /**
   * Получить избранные треки
   */
  async getFavorites(): Promise<Track[]> {
    if (!authService.isAuthenticated()) {
      throw new Error(
        'Необходима авторизация'
      );
    }

    return api.get<Track[]>(
      '/favorites'
    );
  },

  /**
   * Добавить трек в избранное
   */
  async add(
    trackId: number
  ): Promise<void> {

    if (!authService.isAuthenticated()) {
      throw new Error(
        'Необходима авторизация'
      );
    }

    const id = Number(trackId);

    if (!Number.isFinite(id)) {
      throw new Error(
        'Некорректный ID трека'
      );
    }

    await api.post(
      '/favorites',
      {
        trackId: id,
      }
    );
  },

  /**
   * Удалить трек из избранного
   */
  async remove(
    trackId: number
  ): Promise<void> {

    if (!authService.isAuthenticated()) {
      throw new Error(
        'Необходима авторизация'
      );
    }

    const id = Number(trackId);

    if (!Number.isFinite(id)) {
      throw new Error(
        'Некорректный ID трека'
      );
    }

    await api.delete(
      '/favorites',
      {
        trackId: id,
      }
    );
  },

  /**
   * Переключить избранное
   *
   * false → добавляет
   * true  → удаляет
   *
   * Возвращает новое состояние.
   */
  async toggle(
    trackId: number,
    isFavorite: boolean
  ): Promise<boolean> {

    if (isFavorite) {
      await this.remove(trackId);

      return false;
    }

    await this.add(trackId);

    return true;
  },
};