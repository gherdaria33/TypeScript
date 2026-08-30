import { api } from './api';
import type { Track } from '../types';

export const trackService = {
  async getTracks(): Promise<Track[]> {
    // In the supplied backend /tracks is public.
    return api.get<Track[]>('/tracks');
  }
};