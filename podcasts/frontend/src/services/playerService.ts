import type { Track } from '../types';

type PlayerListener = (
  track: Track | null,
  playing: boolean
) => void;

class PlayerService {
  private readonly audio: HTMLAudioElement = new Audio();

  private tracks: Track[] = [];
  private currentIndex = -1;
  private currentSource = '';

  private listeners = new Set<PlayerListener>();

  private shuffle = false;
  private repeat = false;

  private playRequest = 0;

  constructor() {
    this.audio.preload = 'metadata';

    this.audio.addEventListener('play', () => {
      this.notify();
    });

    this.audio.addEventListener('pause', () => {
      this.notify();
    });

    // ВАЖНО:
    // здесь теперь учитывается repeat
    this.audio.addEventListener('ended', () => {
      this.handleEnded();
    });

    this.audio.addEventListener('error', () => {
      console.error('Ошибка audio:', this.audio.error);
      this.notify();
    });
  }

  // ==================================================
  // TRACKS
  // ==================================================

  setTracks(tracks: Track[]): void {
    this.tracks = tracks;

    if (this.currentIndex >= this.tracks.length) {
      this.currentIndex = -1;
    }

    this.notify();
  }

  getCurrent(): Track | null {
    if (this.currentIndex < 0) {
      return null;
    }

    return this.tracks[this.currentIndex] ?? null;
  }

  // ==================================================
  // AUDIO
  // ==================================================

  getAudio(): HTMLAudioElement {
    return this.audio;
  }

  isPlaying(): boolean {
    return !this.audio.paused;
  }

  // ==================================================
  // PLAY
  // ==================================================

  async play(track: Track): Promise<void> {
    const requestId = ++this.playRequest;

    const index = this.tracks.findIndex(
      item => item.id === track.id
    );

    if (index === -1) {
      throw new Error('Трек не найден в списке');
    }

    this.currentIndex = index;

    const source = this.getAudioSource(
      track.encoded_audio
    );

    if (!source) {
      throw new Error(
        `Не удалось получить аудио для трека "${
          track.title || 'Без названия'
        }". Проверь поле encoded_audio.`
      );
    }

    if (this.currentSource !== source) {
      this.currentSource = source;

      this.audio.pause();
      this.audio.src = source;
      this.audio.load();
    }

    if (requestId !== this.playRequest) {
      return;
    }

    try {
      await this.audio.play();

      if (requestId !== this.playRequest) {
        return;
      }

      this.notify();
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === 'AbortError'
      ) {
        return;
      }

      console.error('PLAY ERROR:', error);
      throw error;
    }
  }

  // ==================================================
  // PAUSE
  // ==================================================

  pause(): void {
    this.playRequest++;

    this.audio.pause();

    this.notify();
  }

  // ==================================================
  // PLAY / PAUSE
  // ==================================================

  async toggle(track?: Track): Promise<void> {
    if (
      track &&
      this.getCurrent()?.id !== track.id
    ) {
      await this.play(track);
      return;
    }

    if (!this.getCurrent()) {
      return;
    }

    if (this.audio.paused) {
      try {
        await this.audio.play();
        this.notify();
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === 'AbortError'
        ) {
          return;
        }

        console.error(
          'TOGGLE PLAY ERROR:',
          error
        );

        throw error;
      }
    } else {
      this.pause();
    }
  }

  // ==================================================
  // END
  // ==================================================

  private handleEnded(): void {
    if (!this.tracks.length) {
      return;
    }

    // 🔁 ПОВТОР ТЕКУЩЕГО ТРЕКА
    if (this.repeat) {
      this.audio.currentTime = 0;

      void this.audio.play().catch(error => {
        if (
          error instanceof DOMException &&
          error.name === 'AbortError'
        ) {
          return;
        }

        console.error(
          'REPEAT PLAY ERROR:',
          error
        );
      });

      return;
    }

    // Если Repeat выключен —
    // обычный переход дальше
    this.next();
  }

  // ==================================================
  // NEXT
  // ==================================================

  next(): void {
    if (!this.tracks.length) {
      return;
    }

    if (this.shuffle) {
      this.playRandom();
      return;
    }

    this.currentIndex =
      (this.currentIndex + 1) %
      this.tracks.length;

    this.playCurrent();
  }

  // ==================================================
  // PREVIOUS
  // ==================================================

  previous(): void {
    if (!this.tracks.length) {
      return;
    }

    if (this.shuffle) {
      this.playRandom();
      return;
    }

    this.currentIndex =
      (this.currentIndex - 1 + this.tracks.length) %
      this.tracks.length;

    this.playCurrent();
  }

  // ==================================================
  // CURRENT TRACK
  // ==================================================

  private playCurrent(): void {
    const track = this.getCurrent();

    if (!track) {
      return;
    }

    void this.play(track).catch(error => {
      if (
        error instanceof DOMException &&
        error.name === 'AbortError'
      ) {
        return;
      }

      console.error(
        'PLAYER ERROR:',
        error
      );
    });
  }

  // ==================================================
  // RANDOM
  // ==================================================

  private playRandom(): void {
    if (this.tracks.length === 1) {
      this.currentIndex = 0;
      this.playCurrent();
      return;
    }

    let randomIndex = this.currentIndex;

    while (
      randomIndex === this.currentIndex
    ) {
      randomIndex = Math.floor(
        Math.random() * this.tracks.length
      );
    }

    this.currentIndex = randomIndex;

    this.playCurrent();
  }

  // ==================================================
  // SHUFFLE
  // ==================================================

  setShuffle(enabled: boolean): void {
    this.shuffle = enabled;
    this.notify();
  }

  toggleShuffle(): boolean {
    this.shuffle = !this.shuffle;

    this.notify();

    return this.shuffle;
  }

  isShuffle(): boolean {
    return this.shuffle;
  }

  // ==================================================
  // REPEAT 🔁
  // ==================================================

  setRepeat(enabled: boolean): void {
    this.repeat = enabled;

    this.notify();
  }

  toggleRepeat(): boolean {
    this.repeat = !this.repeat;

    this.notify();

    return this.repeat;
  }

  isRepeat(): boolean {
    return this.repeat;
  }

  // ==================================================
  // SEEK
  // ==================================================

  seek(seconds: number): void {
    if (!Number.isFinite(this.audio.duration)) {
      return;
    }

    const nextTime =
      this.audio.currentTime + seconds;

    this.audio.currentTime = Math.max(
      0,
      Math.min(
        this.audio.duration,
        nextTime
      )
    );
  }

  seekTo(percent: number): void {
    if (!Number.isFinite(this.audio.duration)) {
      return;
    }

    const safePercent = Math.max(
      0,
      Math.min(1, percent)
    );

    this.audio.currentTime =
      this.audio.duration * safePercent;
  }

  // ==================================================
  // VOLUME
  // ==================================================

  setVolume(value: number): void {
    this.audio.volume = Math.max(
      0,
      Math.min(1, value)
    );
  }

  getVolume(): number {
    return this.audio.volume;
  }

  // ==================================================
  // SUBSCRIBE
  // ==================================================

  subscribe(
    listener: PlayerListener
  ): () => void {
    this.listeners.add(listener);

    listener(
      this.getCurrent(),
      this.isPlaying()
    );

    return () => {
      this.listeners.delete(listener);
    };
  }

  // ==================================================
  // NOTIFY
  // ==================================================

  private notify(): void {
    const track = this.getCurrent();
    const playing = this.isPlaying();

    this.listeners.forEach(listener => {
      listener(track, playing);
    });
  }

  // ==================================================
  // AUDIO SOURCE
  // ==================================================

  private getAudioSource(
    value?: string
  ): string | null {
    if (!value) {
      return null;
    }

    const cleanValue = value.trim();

    if (!cleanValue) {
      return null;
    }

    // data:audio/...
    if (
      cleanValue.startsWith('data:audio/')
    ) {
      return cleanValue;
    }

    // Обычная ссылка
    if (
      cleanValue.startsWith('http://') ||
      cleanValue.startsWith('https://') ||
      cleanValue.startsWith('/')
    ) {
      return cleanValue;
    }

    // Base64
    try {
      const decoded = atob(cleanValue);

      if (
        decoded.startsWith('data:audio/')
      ) {
        return decoded;
      }

      const bytes = Uint8Array.from(
        decoded,
        char => char.charCodeAt(0)
      );

      if (bytes.length >= 4) {
        // MP3
        if (
          bytes[0] === 0xff &&
          (bytes[1] & 0xe0) === 0xe0
        ) {
          return this.toDataUrl(
            bytes,
            'audio/mpeg'
          );
        }

        // WAV
        if (
          this.startsWithBytes(bytes, [
            0x52,
            0x49,
            0x46,
            0x46,
          ])
        ) {
          return this.toDataUrl(
            bytes,
            'audio/wav'
          );
        }

        // OGG
        if (
          this.startsWithBytes(bytes, [
            0x4f,
            0x67,
            0x67,
            0x53,
          ])
        ) {
          return this.toDataUrl(
            bytes,
            'audio/ogg'
          );
        }

        // FLAC
        if (
          this.startsWithBytes(bytes, [
            0x66,
            0x4c,
            0x61,
            0x43,
          ])
        ) {
          return this.toDataUrl(
            bytes,
            'audio/flac'
          );
        }
      }
    } catch {
      // Не Base64
    }

    return null;
  }

  // ==================================================
  // DATA URL
  // ==================================================

  private toDataUrl(
    bytes: Uint8Array,
    mime: string
  ): string {
    let binary = '';

    const chunkSize = 0x8000;

    for (
      let i = 0;
      i < bytes.length;
      i += chunkSize
    ) {
      const chunk = bytes.subarray(
        i,
        Math.min(
          i + chunkSize,
          bytes.length
        )
      );

      binary += String.fromCharCode(
        ...chunk
      );
    }

    return `data:${mime};base64,${btoa(
      binary
    )}`;
  }

  // ==================================================
  // CHECK BYTES
  // ==================================================

  private startsWithBytes(
    bytes: Uint8Array,
    signature: number[]
  ): boolean {
    if (
      bytes.length <
      signature.length
    ) {
      return false;
    }

    return signature.every(
      (value, index) =>
        bytes[index] === value
    );
  }
}

export const playerService =
  new PlayerService();
