import type { Track } from '../types';

type PlayerListener = (track: Track | null, playing: boolean) => void;

class PlayerService {
  private readonly audio = new Audio();
  private tracks: Track[] = [];
  private currentIndex = -1;
  private currentSource = '';
  private listeners = new Set<PlayerListener>();

  constructor() {
    this.audio.preload = 'metadata';

    this.audio.addEventListener('play', () => this.notify());
    this.audio.addEventListener('pause', () => this.notify());
    this.audio.addEventListener('ended', () => this.next());
  }

  setTracks(tracks: Track[]): void {
    this.tracks = tracks;
  }

  getCurrent(): Track | null {
    return this.currentIndex >= 0
      ? this.tracks[this.currentIndex] ?? null
      : null;
  }

  isPlaying(): boolean {
    return !this.audio.paused;
  }

  getAudio(): HTMLAudioElement {
    return this.audio;
  }

  async play(track: Track): Promise<void> {
    const index = this.tracks.findIndex(item => item.id === track.id);

    if (index >= 0) {
      this.currentIndex = index;
    }

    const source = this.decodeAudio(track.encoded_audio);

    if (!source) {
      throw new Error(
        'В backend у этого трека нет пригодного аудиопотока. Поле encoded_audio содержит демонстрационные данные.'
      );
    }

    if (this.currentSource !== source) {
      this.currentSource = source;
      this.audio.src = source;
      this.audio.load();
    }

    await this.audio.play();
    this.notify();
  }

  pause(): void {
    this.audio.pause();
  }

  async toggle(track?: Track): Promise<void> {
    if (track && this.getCurrent()?.id !== track.id) {
      await this.play(track);
      return;
    }

    if (this.audio.paused) {
      await this.audio.play();
    } else {
      this.audio.pause();
    }
  }

  seek(seconds: number): void {
    if (!Number.isFinite(this.audio.duration)) return;

    this.audio.currentTime = Math.max(
      0,
      Math.min(this.audio.duration, this.audio.currentTime + seconds)
    );
  }

  seekTo(percent: number): void {
    if (!Number.isFinite(this.audio.duration)) return;
    this.audio.currentTime = this.audio.duration * percent;
  }

  next(): void {
    if (!this.tracks.length) return;

    this.currentIndex = (this.currentIndex + 1) % this.tracks.length;
    const track = this.getCurrent();

    if (track) {
      void this.play(track).catch(error => {
        console.error(error);
      });
    }
  }

  previous(): void {
    if (!this.tracks.length) return;

    this.currentIndex =
      (this.currentIndex - 1 + this.tracks.length) % this.tracks.length;

    const track = this.getCurrent();

    if (track) {
      void this.play(track).catch(error => {
        console.error(error);
      });
    }
  }

  subscribe(listener: PlayerListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener =>
      listener(this.getCurrent(), this.isPlaying())
    );
  }

  private decodeAudio(value?: string): string | null {
    if (!value) return null;

    // Supports a backend value already formatted as a data URL.
    if (value.startsWith('data:audio/')) {
      return value;
    }

    // The supplied backend contains Base64 strings. If those strings
    // decode to an audio data URL, use it.
    try {
      const decoded = atob(value);

      if (decoded.startsWith('data:audio/')) {
        return decoded;
      }
    } catch {
      return null;
    }

    // The uploaded backend's demo values decode to ordinary text such as
    // "Audio data for Eternal Sunset..." rather than actual audio bytes.
    // Do not pretend such data is playable.
    return null;
  }
}

export const playerService = new PlayerService();