import type { Track } from './trackService';

const FAVORITES_KEY =
  'favoriteTracks';

class FavoriteService {
  private getIds(): string[] {
    const raw =
      localStorage.getItem(
        FAVORITES_KEY,
      );

    if (!raw) {
      return [];
    }

    try {
      const parsed =
        JSON.parse(raw);

      if (
        !Array.isArray(parsed)
      ) {
        return [];
      }

      return parsed.map(
        (id) => String(id),
      );
    } catch {
      return [];
    }
  }

  private saveIds(
    ids: string[],
  ): void {
    localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(ids),
    );
  }

  getFavorites(): string[] {
    return this.getIds();
  }

  isFavorite(
    trackId: number | string,
  ): boolean {
    return this.getIds().includes(
      String(trackId),
    );
  }

  async addFavorite(
    trackId: number | string,
  ): Promise<void> {
    const ids =
      this.getIds();

    const id =
      String(trackId);

    if (!ids.includes(id)) {
      ids.push(id);

      this.saveIds(ids);
    }
  }

  async removeFavorite(
    trackId: number | string,
  ): Promise<void> {
    const id =
      String(trackId);

    const ids =
      this.getIds().filter(
        (item) =>
          item !== id,
      );

    this.saveIds(ids);
  }

  async toggleFavorite(
    trackId: number | string,
  ): Promise<boolean> {
    if (
      this.isFavorite(trackId)
    ) {
      await this.removeFavorite(
        trackId,
      );

      return false;
    }

    await this.addFavorite(
      trackId,
    );

    return true;
  }

  async getFavoriteTracks(
    tracks: Track[],
  ): Promise<Track[]> {
    const ids =
      this.getIds();

    return tracks.filter(
      (track) =>
        ids.includes(
          String(track.id),
        ),
    );
  }

  clear(): void {
    localStorage.removeItem(
      FAVORITES_KEY,
    );
  }
}

export const favoriteService =
  new FavoriteService();