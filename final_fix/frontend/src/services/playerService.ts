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
    if (this.currentIndex >= tracks.length) {
      this.currentIndex = -1;
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
      this.currentSource = '';
    }
    this.notify();
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
    if (index < 0) {
      throw new Error('Трек отсутствует в текущем списке воспроизведения.');
    }

    this.currentIndex = index;
    const source = this.decodeAudio(track.encoded_audio);

    if (!source) {
      this.audio.pause();
      throw new Error('У этого трека отсутствует корректный аудиопоток.');
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
    if (track) {
      if (this.getCurrent()?.id !== track.id) {
        await this.play(track);
        return;
      }
      if (this.audio.paused) {
        if (!this.audio.src) {
          await this.play(track);
          return;
        }
        await this.audio.play();
      } else {
        this.audio.pause();
      }
      return;
    }

    if (!this.getCurrent()) return;

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
    const safePercent = Math.max(0, Math.min(1, percent));
    this.audio.currentTime = this.audio.duration * safePercent;
  }

  next(): void {
    if (!this.tracks.length) return;
    this.currentIndex = (this.currentIndex + 1) % this.tracks.length;
    const track = this.getCurrent();
    if (track) void this.play(track).catch(console.error);
  }

  previous(): void {
    if (!this.tracks.length) return;
    this.currentIndex =
      (this.currentIndex - 1 + this.tracks.length) % this.tracks.length;
    const track = this.getCurrent();
    if (track) void this.play(track).catch(console.error);
  }

  subscribe(listener: PlayerListener): () => void {
    this.listeners.add(listener);
    listener(this.getCurrent(), this.isPlaying());
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener =>
      listener(this.getCurrent(), this.isPlaying())
    );
  }

  private decodeAudio(value?: string): string | null {
    if (!value) return null;
    if (value.startsWith('data:audio/')) return value;

    try {
      const decoded = atob(value);
      if (decoded.startsWith('data:audio/')) return decoded;
    } catch {
      return null;
    }

    return null;
  }
}

export const playerService = new PlayerService();
