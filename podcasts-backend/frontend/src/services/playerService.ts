import type { Track } from './trackService';

type PlayerListener = (
  track: Track | null,
  isPlaying: boolean,
) => void;

type ProgressListener = (
  currentTime: number,
  duration: number,
) => void;

class PlayerService {
  private audio: HTMLAudioElement;

  private currentTrack: Track | null = null;

  private tracks: Track[] = [];

  private currentIndex = -1;

  private playerListeners: PlayerListener[] = [];

  private progressListeners: ProgressListener[] =
    [];

  constructor() {
    this.audio =
      new Audio();

    this.audio.preload = 'metadata';

    this.audio.volume = 0.8;

    this.audio.addEventListener(
      'timeupdate',
      () => {
        this.notifyProgress();
      },
    );

    this.audio.addEventListener(
      'loadedmetadata',
      () => {
        this.notifyProgress();
      },
    );

    this.audio.addEventListener(
      'ended',
      () => {
        void this.next();
      },
    );

    this.audio.addEventListener(
      'play',
      () => {
        this.notifyPlayer();
      },
    );

    this.audio.addEventListener(
      'pause',
      () => {
        this.notifyPlayer();
      },
    );
  }

  setTracks(
    tracks: Track[],
  ): void {
    this.tracks = [...tracks];

    if (
      this.currentTrack
    ) {
      const index =
        this.tracks.findIndex(
          (track) =>
            String(track.id) ===
            String(
              this.currentTrack?.id,
            ),
        );

      this.currentIndex =
        index;
    }
  }

  getCurrentTrack(): Track | null {
    return this.currentTrack;
  }

  isPlaying(): boolean {
    return !this.audio.paused;
  }

  getCurrentTime(): number {
    return this.audio.currentTime || 0;
  }

  getDuration(): number {
    return (
      this.audio.duration || 0
    );
  }

  getVolume(): number {
    return this.audio.volume;
  }

  async play(
    track?: Track,
  ): Promise<void> {
    if (track) {
      const sameTrack =
        this.currentTrack &&
        String(
          this.currentTrack.id,
        ) === String(track.id);

      if (!sameTrack) {
        this.loadTrack(track);
      }
    }

    if (!this.currentTrack) {
      return;
    }

    const source =
      this.currentTrack.audioUrl ||
      this.currentTrack.url;

    if (!source) {
      throw new Error(
        'У этого трека отсутствует аудиофайл.',
      );
    }

    try {
      await this.audio.play();
    } catch {
      throw new Error(
        'Не удалось воспроизвести аудио.',
      );
    }

    this.notifyPlayer();
  }

  pause(): void {
    this.audio.pause();

    this.notifyPlayer();
  }

  async toggle(
    track?: Track,
  ): Promise<void> {
    if (track) {
      const sameTrack =
        this.currentTrack &&
        String(
          this.currentTrack.id,
        ) === String(track.id);

      if (
        sameTrack &&
        this.isPlaying()
      ) {
        this.pause();
        return;
      }

      await this.play(track);
      return;
    }

    if (this.isPlaying()) {
      this.pause();
      return;
    }

    await this.play();
  }

  loadTrack(
    track: Track,
  ): void {
    this.audio.pause();

    this.currentTrack =
      track;

    const index =
      this.tracks.findIndex(
        (item) =>
          String(item.id) ===
          String(track.id),
      );

    this.currentIndex =
      index;

    const source =
      track.audioUrl ||
      track.url;

    if (!source) {
      this.audio.removeAttribute(
        'src',
      );

      this.audio.load();

      this.notifyPlayer();

      return;
    }

    this.audio.src =
      source;

    this.audio.load();

    this.notifyPlayer();
    this.notifyProgress();
  }

  async next(): Promise<void> {
    if (
      this.tracks.length === 0
    ) {
      return;
    }

    let nextIndex =
      this.currentIndex + 1;

    if (
      nextIndex >=
      this.tracks.length
    ) {
      nextIndex = 0;
    }

    const nextTrack =
      this.tracks[nextIndex];

    if (!nextTrack) {
      return;
    }

    this.loadTrack(
      nextTrack,
    );

    await this.play();
  }

  async previous(): Promise<void> {
    if (
      this.tracks.length === 0
    ) {
      return;
    }

    /*
     * Если прошло больше 3 секунд,
     * Previous сначала возвращает
     * трек в начало.
     */

    if (
      this.audio.currentTime > 3
    ) {
      this.seek(0);
      return;
    }

    let previousIndex =
      this.currentIndex - 1;

    if (
      previousIndex < 0
    ) {
      previousIndex =
        this.tracks.length - 1;
    }

    const previousTrack =
      this.tracks[
        previousIndex
      ];

    if (!previousTrack) {
      return;
    }

    this.loadTrack(
      previousTrack,
    );

    await this.play();
  }

  seek(
    time: number,
  ): void {
    const duration =
      this.getDuration();

    if (!duration) {
      return;
    }

    const safeTime =
      Math.max(
        0,
        Math.min(
          time,
          duration,
        ),
      );

    this.audio.currentTime =
      safeTime;

    this.notifyProgress();
  }

  seekPercent(
    percent: number,
  ): void {
    const duration =
      this.getDuration();

    if (!duration) {
      return;
    }

    const safePercent =
      Math.max(
        0,
        Math.min(
          percent,
          100,
        ),
      );

    this.seek(
      duration *
        (safePercent / 100),
    );
  }

  setVolume(
    volume: number,
  ): void {
    const safeVolume =
      Math.max(
        0,
        Math.min(
          volume,
          1,
        ),
      );

    this.audio.volume =
      safeVolume;
  }

  mute(): void {
    this.audio.muted = true;
  }

  unmute(): void {
    this.audio.muted = false;
  }

  isMuted(): boolean {
    return this.audio.muted;
  }

  onPlayerChange(
    listener: PlayerListener,
  ): () => void {
    this.playerListeners.push(
      listener,
    );

    listener(
      this.currentTrack,
      this.isPlaying(),
    );

    return () => {
      this.playerListeners =
        this.playerListeners.filter(
          (item) =>
            item !== listener,
        );
    };
  }

  onProgress(
    listener: ProgressListener,
  ): () => void {
    this.progressListeners.push(
      listener,
    );

    listener(
      this.getCurrentTime(),
      this.getDuration(),
    );

    return () => {
      this.progressListeners =
        this.progressListeners.filter(
          (item) =>
            item !== listener,
        );
    };
  }

  destroy(): void {
    this.audio.pause();

    this.audio.removeAttribute(
      'src',
    );

    this.audio.load();

    this.playerListeners = [];

    this.progressListeners = [];

    this.currentTrack = null;

    this.tracks = [];

    this.currentIndex = -1;
  }

  private notifyPlayer(): void {
    this.playerListeners.forEach(
      (listener) => {
        listener(
          this.currentTrack,
          this.isPlaying(),
        );
      },
    );
  }