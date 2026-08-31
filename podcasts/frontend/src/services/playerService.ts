import type { Track } from '../types';

type PlayerListener = (
  track: Track | null,
  playing: boolean
) => void;

class PlayerService {
  private readonly audio: HTMLAudioElement =
    new Audio();

  private tracks: Track[] = [];

  private currentIndex = -1;

  private currentSource = '';

  private listeners =
    new Set<PlayerListener>();

  private shuffle = false;

  // Нужен для отмены предыдущего запуска
  private playRequest = 0;

  constructor() {
    this.audio.preload = 'metadata';

    this.audio.addEventListener(
      'play',
      () => {
        this.notify();
      }
    );

    this.audio.addEventListener(
      'pause',
      () => {
        this.notify();
      }
    );

    this.audio.addEventListener(
      'ended',
      () => {
        this.next();
      }
    );

    this.audio.addEventListener(
      'error',
      () => {
        console.error(
          'Ошибка audio:',
          this.audio.error
        );

        this.notify();
  }
    );
  }

  // ==================================================
  // TRACKS
  // ==================================================

  setTracks(
    tracks: Track[]
  ): void {
    this.tracks = tracks;

    if (
      this.currentIndex >=
      this.tracks.length
    ) {
      this.currentIndex = -1;
    }

    this.notify();
  }

  getCurrent(): Track | null {
    if (
      this.currentIndex < 0
    ) {
      return null;
    }

    return (
      this.tracks[
        this.currentIndex
      ] ?? null
    );
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

  async play(
    track: Track
  ): Promise<void> {
    const requestId =
      ++this.playRequest;

    const index =
      this.tracks.findIndex(
        item =>
          item.id === track.id
      );

    if (index === -1) {
      throw new Error(
        'Трек не найден в списке'
      );
    }

    this.currentIndex =
      index;

    const source =
      this.getAudioSource(
        track.encoded_audio
      );

    if (!source) {
      throw new Error(
        `Не удалось получить аудио для трека "${track.title || 'Без названия'}". Проверь поле encoded_audio.`
      );
    }

    // Если это новый источник
    if (
      this.currentSource !==
      source
    ) {
      this.currentSource =
        source;

      // Останавливаем предыдущий
      this.audio.pause();

      // Устанавливаем новый source
      this.audio.src =
        source;

      // Загружаем новый источник
      this.audio.load();
    }

    // Если за это время пользователь
    // уже выбрал другой трек
    if (
      requestId !==
      this.playRequest
    ) {
      return;
    }

    try {
    await this.audio.play();

      // Проверяем ещё раз
      if (
        requestId !==
        this.playRequest
      ) {
        return;
      }

    this.notify();
    } catch (error) {
      // Быстрое переключение треков
      // не должно ломать приложение.
      if (
        error instanceof DOMException &&
        error.name ===
          'AbortError'
      ) {
        return;
      }

      console.error(
        'PLAY ERROR:',
        error
      );

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

  async toggle(
    track?: Track
  ): Promise<void> {
    // Если пользователь нажал
    // на другой трек
    if (
      track &&
      this.getCurrent()?.id !==
        track.id
    ) {
      await this.play(track);
      return;
    }

    // Если трек не выбран
    if (!this.getCurrent()) {
      return;
    }

    if (
      this.audio.paused
    ) {
      try {
      await this.audio.play();

        this.notify();
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name ===
            'AbortError'
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
  // NEXT
  // ==================================================

  next(): void {
    if (
      !this.tracks.length
    ) {
      return;
    }

    if (
      this.shuffle
    ) {
      this.playRandom();
      return;
    }

    this.currentIndex =
      (
        this.currentIndex +
        1
      ) %
      this.tracks.length;

    this.playCurrent();
  }

  // ==================================================
  // PREVIOUS
  // ==================================================

  previous(): void {
    if (
      !this.tracks.length
    ) {
      return;
    }

    if (
      this.shuffle
    ) {
      this.playRandom();
      return;
    }

    this.currentIndex =
      (
        this.currentIndex -
        1 +
        this.tracks.length
      ) %
      this.tracks.length;

    this.playCurrent();
  }

  // ==================================================
  // CURRENT TRACK
  // ==================================================

  private playCurrent(): void {
    const track =
      this.getCurrent();

    if (!track) {
      return;
    }

    void this.play(track).catch(
      error => {
        if (
          error instanceof DOMException &&
          error.name ===
            'AbortError'
        ) {
          return;
        }

        console.error(
          'PLAYER ERROR:',
          error
        );
      }
    );
    }

  // ==================================================
  // RANDOM
  // ==================================================

  private playRandom(): void {
    if (
      this.tracks.length === 1
    ) {
      this.currentIndex = 0;

      this.playCurrent();

      return;
    }

    let randomIndex =
      this.currentIndex;

    while (
      randomIndex ===
      this.currentIndex
    ) {
      randomIndex =
        Math.floor(
          Math.random() *
            this.tracks.length
        );
    }

    this.currentIndex =
      randomIndex;

    this.playCurrent();
  }

  // ==================================================
  // SHUFFLE
  // ==================================================

  setShuffle(
    enabled: boolean
  ): void {
    this.shuffle =
      enabled;

    this.notify();
  }

  toggleShuffle(): boolean {
    this.shuffle =
      !this.shuffle;

    this.notify();

    return this.shuffle;
  }

  isShuffle(): boolean {
    return this.shuffle;
  }

  // ==================================================
  // SEEK
  // ==================================================

  seek(
    seconds: number
  ): void {
    if (
      !Number.isFinite(
        this.audio.duration
      )
    ) {
      return;
    }

    const nextTime =
      this.audio.currentTime +
      seconds;

    this.audio.currentTime =
      Math.max(
        0,
        Math.min(
          this.audio.duration,
          nextTime
        )
      );
  }

  seekTo(
    percent: number
  ): void {
    if (
      !Number.isFinite(
        this.audio.duration
      )
    ) {
      return;
    }

    const safePercent =
      Math.max(
        0,
        Math.min(
          1,
          percent
        )
      );

    this.audio.currentTime =
      this.audio.duration *
      safePercent;
  }

  // ==================================================
  // VOLUME
  // ==================================================

  setVolume(
    value: number
  ): void {
    this.audio.volume =
      Math.max(
        0,
        Math.min(
          1,
          value
        )
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
    this.listeners.add(
      listener
    );

    // Сразу передаём
    // текущее состояние
    listener(
      this.getCurrent(),
      this.isPlaying()
    );

    return () => {
      this.listeners.delete(
        listener
      );
    };
  }

  // ==================================================
  // NOTIFY
  // ==================================================

  private notify(): void {
    const track =
      this.getCurrent();

    const playing =
      this.isPlaying();

    this.listeners.forEach(
      listener => {
        listener(
          track,
          playing
        );
      }
    );
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

    const cleanValue =
      value.trim();

    if (!cleanValue) {
      return null;
    }

    // ------------------------------------------
    // Уже готовый data URL
    // ------------------------------------------

    if (
      cleanValue.startsWith(
        'data:audio/'
      )
    ) {
      return cleanValue;
    }

    // ------------------------------------------
    // Обычная ссылка на audio
    // ------------------------------------------

    if (
      cleanValue.startsWith(
        'http://'
      ) ||
      cleanValue.startsWith(
        'https://'
      ) ||
      cleanValue.startsWith(
        '/'
      )
    ) {
      return cleanValue;
    }

    // ------------------------------------------
    // Base64
    // ------------------------------------------

    try {
      const decoded =
        atob(cleanValue);

      // Base64 внутри содержит
      // data:audio/...
      if (
        decoded.startsWith(
          'data:audio/'
        )
      ) {
        return decoded;
      }

      const bytes =
        Uint8Array.from(
          decoded,
          char =>
            char.charCodeAt(0)
        );

      if (
        bytes.length >= 4
      ) {
        // MP3 / MPEG
        if (
          bytes[0] === 0xff &&
          (bytes[1] & 0xe0) ===
            0xe0
        ) {
          return this.toDataUrl(
            bytes,
            'audio/mpeg'
          );
        }

        // WAV
        if (
          this.startsWithBytes(
            bytes,
            [
              0x52,
              0x49,
              0x46,
              0x46,
            ]
          )
        ) {
          return this.toDataUrl(
            bytes,
            'audio/wav'
          );
        }

        // OGG
        if (
          this.startsWithBytes(
            bytes,
            [
              0x4f,
              0x67,
              0x67,
              0x53,
            ]
          )
        ) {
          return this.toDataUrl(
            bytes,
            'audio/ogg'
          );
        }

        // FLAC
        if (
          this.startsWithBytes(
            bytes,
            [
              0x66,
              0x4c,
              0x61,
              0x43,
            ]
          )
        ) {
          return this.toDataUrl(
            bytes,
            'audio/flac'
          );
        }
      }
    } catch {
      // Это не Base64.
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
      const chunk =
        bytes.subarray(
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
