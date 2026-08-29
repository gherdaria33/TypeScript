import type { Track } from '../types/track';

export interface AudioPlayerOptions {
  onNext?: () => void;
  onPrevious?: () => void;
}

export class AudioPlayer {
  private readonly options: AudioPlayerOptions;

  private readonly audio: HTMLAudioElement;

  private container: HTMLElement | null = null;

  private currentTrack: Track | null = null;

  public constructor(
    options: AudioPlayerOptions = {},
  ) {
    this.options = options;

    this.audio =
      new Audio();

    this.audio.preload =
      'metadata';

    this.bindAudioEvents();
  }

  public render(
    container: HTMLElement,
  ): HTMLElement {
    this.container =
      container;

    container.innerHTML = `
      <div class="audio-player">
        <div class="audio-player__track">
          <div class="audio-player__cover">
            ♪
          </div>

          <div class="audio-player__info">
            <div
              class="audio-player__title"
              data-player-title
            >
              Трек не выбран
            </div>

            <div
              class="audio-player__artist"
              data-player-artist
            >
              Выберите композицию
            </div>
          </div>
        </div>

        <div class="audio-player__controls">
          <div class="audio-player__buttons">
            <button
              class="audio-player__button"
              type="button"
              data-previous
              aria-label="Предыдущий трек"
            >
              |◀
            </button>

            <button
              class="audio-player__button
                     audio-player__button--small"
              type="button"
              data-backward
              aria-label="Назад на 10 секунд"
            >
              −10
            </button>

            <button
              class="
                audio-player__button
                audio-player__button--play
              "
              type="button"
              data-play
              aria-label="Воспроизвести"
            >
              ▶
            </button>

            <button
              class="audio-player__button
                     audio-player__button--small"
              type="button"
              data-forward
              aria-label="Вперёд на 10 секунд"
            >
              +10
            </button>

            <button
              class="audio-player__button"
              type="button"
              data-next
              aria-label="Следующий трек"
            >
              ▶|
            </button>
          </div>

          <div class="audio-player__progress">
            <span
              class="audio-player__time"
              data-current-time
            >
              00:00
            </span>

            <input
              class="audio-player__range"
              type="range"
              min="0"
              max="100"
              value="0"
              step="0.1"
              data-progress
              aria-label="Прогресс композиции"
            />

            <span
              class="audio-player__time"
              data-duration
            >
              00:00
            </span>
          </div>
        </div>

        <div class="audio-player__volume">
          <span class="audio-player__volume-icon">
            🔊
          </span>

          <input
            class="audio-player__volume-range"
            type="range"
            min="0"
            max="1"
            value="1"
            step="0.01"
            data-volume
            aria-label="Громкость"
          />
        </div>
      </div>
    `;

    this.bindControls(
      container,
    );

    return container;
  }

  public setTrack(
    track: Track,
  ): void {
    this.currentTrack =
      track;

    const possibleTrack =
      track as Track & {
        url?: string;
        audioUrl?: string;
        src?: string;
      };

    const source =
      possibleTrack.audioUrl ??
      possibleTrack.url ??
      possibleTrack.src;

    if (source) {
      this.audio.src =
        source;
    }

    this.audio.load();

    this.updateTrackInfo();

    this.updatePlayButton();
  }

  public play(): void {
    if (!this.audio.src) {
      return;
    }

    void this.audio.play()
      .catch(
        (error: unknown) => {
          console.error(
            'Не удалось воспроизвести аудио:',
            error,
          );
        },
      );
  }

  public pause(): void {
    this.audio.pause();
  }

  public togglePlay(): void {
    if (
      this.audio.paused
    ) {
      this.play();
    } else {
      this.pause();
    }
  }

  private bindControls(
    container: HTMLElement,
  ): void {
    const play =
      container.querySelector<HTMLButtonElement>(
        '[data-play]',
      );

    const previous =
      container.querySelector<HTMLButtonElement>(
        '[data-previous]',
      );

    const next =
      container.querySelector<HTMLButtonElement>(
        '[data-next]',
      );

    const backward =
      container.querySelector<HTMLButtonElement>(
        '[data-backward]',
      );

    const forward =
      container.querySelector<HTMLButtonElement>(
        '[data-forward]',
      );

    const progress =
      container.querySelector<HTMLInputElement>(
        '[data-progress]',
      );

    const volume =
      container.querySelector<HTMLInputElement>(
        '[data-volume]',
      );

    play?.addEventListener(
      'click',
      () => {
        this.togglePlay();
      },
    );

    previous?.addEventListener(
      'click',
      () => {
        this.options.onPrevious?.();
      },
    );

    next?.addEventListener(
      'click',
      () => {
        this.options.onNext?.();
      },
    );

    backward?.addEventListener(
      'click',
      () => {
        this.seekBy(-10);
      },
    );

    forward?.addEventListener(
      'click',
      () => {
        this.seekBy(10);
      },
    );

    progress?.addEventListener(
      'input',
      () => {
        const percent =
          Number(progress.value);

        if (
          Number.isFinite(
            this.audio.duration,
          )
        ) {
          this.audio.currentTime =
            (
              percent / 100
            ) *
            this.audio.duration;
        }
      },
    );

    volume?.addEventListener(
      'input',
      () => {
        this.audio.volume =
          Number(volume.value);
      },
    );
  }

  private bindAudioEvents(): void {
    this.audio.addEventListener(
      'timeupdate',
      () => {
        this.updateProgress();
      },
    );

    this.audio.addEventListener(
      'loadedmetadata',
      () => {
        this.updateDuration();
        this.updateProgress();
      },
    );

    this.audio.addEventListener(
      'play',
      () => {
        this.updatePlayButton();
      },
    );

    this.audio.addEventListener(
      'pause',
      () => {
        this.updatePlayButton();
      },
    );

    this.audio.addEventListener(
      'ended',
      () => {
        this.options.onNext?.();
      },
    );
  }

  private seekBy(
    seconds: number,
  ): void {
    if (
      !Number.isFinite(
        this.audio.duration,
      )
    ) {
      return;
    }

    const newTime =
      this.audio.currentTime +
      seconds;

    this.audio.currentTime =
      Math.max(
        0,
        Math.min(
          newTime,
          this.audio.duration,
        ),
      );
  }

  private updateTrackInfo(): void {
    if (!this.container) {
      return;
    }

    const title =
      this.container.querySelector<HTMLElement>(
        '[data-player-title]',
      );

    const artist =
      this.container.querySelector<HTMLElement>(
        '[data-player-artist]',
      );

    if (!this.currentTrack) {
      return;
    }

    if (title) {
      title.textContent =
        this.currentTrack.title;
    }

    if (artist) {
      artist.textContent =
        this.currentTrack.artist;
    }
  }

  private updatePlayButton(): void {
    if (!this.container) {
      return;
    }

    const button =
      this.container.querySelector<HTMLButtonElement>(
        '[data-play]',
      );

    if (!button) {
      return;
    }

    if (
      this.audio.paused
    ) {
      button.textContent =
        '▶';

      button.setAttribute(
        'aria-label',
        'Воспроизвести',
      );
    } else {
      button.textContent =
        'Ⅱ';

      button.setAttribute(
        'aria-label',
        'Пауза',
      );
    }
  }

  private updateProgress(): void {
    if (!this.container) {
      return;
    }

    const progress =
      this.container.querySelector<HTMLInputElement>(
        '[data-progress]',
      );

    const currentTime =
      this.container.querySelector<HTMLElement>(
        '[data-current-time]',
      );

    if (
      progress &&
      Number.isFinite(
        this.audio.duration,
      ) &&
      this.audio.duration > 0
    ) {
      progress.value =
        String(
          (
            this.audio.currentTime /
            this.audio.duration
          ) * 100,
        );
    }

    if (currentTime) {
      currentTime.textContent =
        this.formatTime(
          this.audio.currentTime,
        );
    }
  }

  private updateDuration(): void {
    if (!this.container) {
      return;
    }

    const duration =
      this.container.querySelector<HTMLElement>(
        '[data-duration]',
      );

    if (duration) {
      duration.textContent =
        this.formatTime(
          this.audio.duration,
        );
    }
  }

  private formatTime(
    seconds: number,
  ): string {
    if (
      !Number.isFinite(seconds) ||
      seconds < 0
    ) {
      return '00:00';
    }

    const minutes =
      Math.floor(
        seconds / 60,
      );

    const remaining =
      Math.floor(
        seconds % 60,
      );

    return `${String(
      minutes,
    ).padStart(2, '0')}:${String(
      remaining,
    ).padStart(2, '0')}`;
  }
}
