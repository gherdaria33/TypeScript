import { api } from './api';

export interface Track {
  id: number | string;

  title: string;

  artist: string;

  album?: string;

  cover?: string;

  audioUrl?: string;

  url?: string;

  duration?: number;

  durationFormatted?: string;

  genre?: string;
}

class TrackService {
  private cache:
    | Track[]
    | null = null;

  async getTracks(): Promise<Track[]> {
    if (this.cache) {
      return this.cache;
    }

    const response =
      await api.getTracks();

    const data =
      Array.isArray(response)
        ? response
        : this.extractTracks(
            response,
          );

    this.cache =
      data.map(
        (item) =>
          this.normalizeTrack(item),
      );

    return this.cache;
  }

  async getTrack(
    id: number | string,
  ): Promise<Track | null> {
    const tracks =
      await this.getTracks();

    return (
      tracks.find(
        (track) =>
          String(track.id) ===
          String(id),
      ) ?? null
    );
  }

  clearCache(): void {
    this.cache = null;
  }

  search(
    tracks: Track[],
    query: string,
  ): Track[] {
    const value =
      query
        .trim()
        .toLowerCase();

    if (!value) {
      return tracks;
    }

    return tracks.filter(
      (track) =>
        track.title
          .toLowerCase()
          .includes(value) ||
        track.artist
          .toLowerCase()
          .includes(value) ||
        (
          track.album ?? ''
        )
          .toLowerCase()
          .includes(value) ||
        (
          track.genre ?? ''
        )
          .toLowerCase()
          .includes(value),
    );
  }

  private extractTracks(
    response: unknown,
  ): unknown[] {
    if (
      typeof response !==
        'object' ||
      response === null
    ) {
      return [];
    }

    const data =
      response as Record<
        string,
        unknown
      >;

    if (
      Array.isArray(
        data.tracks,
      )
    ) {
      return data.tracks;
    }

    if (
      Array.isArray(
        data.data,
      )
    ) {
      return data.data;
    }

    if (
      Array.isArray(
        data.results,
      )
    ) {
      return data.results;
    }

    return [];
  }

  private normalizeTrack(
    value: unknown,
  ): Track {
    const item =
      (
        value ?? {}
      ) as Record<
        string,
        unknown
      >;

    const id =
      item.id ??
      item._id ??
      crypto.randomUUID();

    const title =
      this.stringValue(
        item.title,
        item.name,
      ) || 'Без названия';

    const artist =
      this.stringValue(
        item.artist,
        item.author,
      ) || 'Неизвестный исполнитель';

    const album =
      this.stringValue(
        item.album,
      );

    const cover =
      this.stringValue(
        item.cover,
        item.coverUrl,
        item.image,
        item.imageUrl,
      );

    const audioUrl =
      this.stringValue(
        item.audioUrl,
        item.audio,
        item.src,
        item.url,
      );

    const duration =
      this.numberValue(
        item.duration,
        item.durationSeconds,
      );

    return {
      id:
        typeof id ===
          'number' ||
        typeof id ===
          'string'
          ? id
          : String(id),

      title,

      artist,

      album:
        album || undefined,

      cover:
        cover || undefined,

      audioUrl:
        audioUrl || undefined,

      url:
        this.stringValue(
          item.url,
        ) || undefined,

      duration:
        duration || undefined,

      durationFormatted:
        duration
          ? this.formatDuration(
              duration,
            )
          : undefined,

      genre:
        this.stringValue(
          item.genre,
        ) || undefined,
    };
  }

  private stringValue(
    ...values: unknown[]
  ): string {
    const value =
      values.find(
        (item) =>
          typeof item ===
            'string' &&
          item.trim().length > 0,
      );

    return typeof value ===
      'string'
      ? value.trim()
      : '';
  }

  private numberValue(
    ...values: unknown[]
  ): number {
    const value =
      values.find(
        (item) =>
          typeof item ===
            'number' &&
          Number.isFinite(item),
      );

    return typeof value ===
      'number'
      ? value
      : 0;
  }

  private formatDuration(
    seconds: number,
  ): string {
    const total =
      Math.floor(seconds);

    const minutes =
      Math.floor(
        total / 60,
      );

    const remaining =
      total % 60;

    return `${String(
      minutes,
    ).padStart(
      2,
      '0',
    )}:${String(
      remaining,
    ).padStart(
      2,
      '0',
    )}`;
  }
}

export const trackService =
  new TrackService();