import { el, setChildren } from 'redom';

import type { Track } from '../../types/Track';
import { formatTime } from '../../utils/formatTime';

export interface AudioPlayerOptions {
  onFavorite: (track: Track) => void;
  isFavorite: (trackId: string) => boolean;
}

export class AudioPlayer {
  private readonly audio: HTMLAudioElement;

  private readonly titleElement: HTMLElement;
  private readonly artistElement: HTMLElement;
  private readonly coverElement: HTMLElement;
  private readonly currentTimeElement: HTMLElement;
  private readonly durationElement: HTMLElement;
  private readonly progress: HTMLInputElement;
  private readonly playButton: HTMLButtonElement;
  private readonly favoriteButton: HTMLButtonElement;

  private readonly options: AudioPlayerOptions;

  private tracks: Track[] = [];
  private currentIndex = -1;

  constructor(options: AudioPlayerOptions) {
    this.options = options;

    this.audio = new Audio();

    this.audio.preload = 'metadata';

    this.titleElement = el(
      'div.player__title',
      'Трек не выбран'
    );

    this.artistElement = el(
      'div.player__artist',
      'Выберите композицию'
    );

    this.coverElement = el(
      'div.player__cover',
      '♫'
    );

    this.currentTimeElement = el(
      'span.player__time',
      '00:00'
    );

    this.durationElement = el(
      'span.player__duration',
      '00:00'
    );

    this.progress = el(
      'input.player__progress'
    ) as HTMLInputElement;

    this.progress.type = 'range';
    this.progress.min = '0';
    this.progress.max = '100';
    this.progress.value = '0';
    this.progress.step = '0.1';

    this.playButton = el(
      'button.player__play',
      '▶'
    ) as HTMLButtonElement;

    this.playButton.type = 'button';

    this.favoriteButton = el(
      'button.player__favorite',
      '♡'
    ) as HTMLButtonElement;

    this.favoriteButton.type = 'button';

    this.setupEvents();
  }

  setTracks(tracks: Track[]): void {
    this.tracks = tracks;
  }

  render(): HTMLElement {
    const player = el(
      'section.player'
    );

    const trackInformation = el(
      'div.player__track'
    );

    setChildren(
      trackInformation,
      this.coverElement,
      el(
        'div.player__metadata',
        this.titleElement,
        this.artistElement
      ),
      this.favoriteButton
    );

    const controls = el(
      'div.player__controls'
    );

    const previousButton = el(
      'button.player__secondary-button',
      '⏮'
    ) as HTMLButtonElement;

    previousButton.type = 'button';

    previousButton.addEventListener(
      'click',
      () => {
        this.previous();
      }
    );

    const rewindButton = el(
      'button.player__secondary-button',
      '↶ 10'
    ) as HTMLButtonElement;

    rewindButton.type = 'button';

    rewindButton.addEventListener(
      'click',
      () => {
        this.seek(-10);
      }
    );

    this.playButton.addEventListener(
      'click',
      () => {
        void this.togglePlay();
      }
    );

    const forwardButton = el(
      'button.player__secondary-button',
      '10 ↷'
    ) as HTMLButtonElement;

    forwardButton.type = 'button';

    forwardButton.addEventListener(
      'click',
      () => {
        this.seek(10);
      }
    );

    const nextButton = el(
      'button.player__secondary-button',
      '⏭'
    ) as HTMLButtonElement;

    nextButton.type = 'button';

    nextButton.addEventListener(
      'click',
      () => {
        this.next();
      }
    );

    setChildren(
      controls,
      previousButton,
      rewindButton,
      this.playButton,
      forwardButton,
      nextButton
    );

    const timeline = el(
      'div.player__timeline'
    );

    setChildren(
      timeline,
      this.currentTimeElement,
      this.progress,
      this.durationElement
    );

    const volume = el(
      'div.player__volume'
    );

    const volumeIcon = el(
      'span.player__volume-icon',
      '🔊'
    );

    const volumeInput = el(
      'input.player__volume-input'
    ) as HTMLInputElement;

    volumeInput.type = 'range';
    volumeInput.min = '0';
    volumeInput.max = '1';
    volumeInput.step = '0.01';
    volumeInput.value = '1';

    volumeInput.addEventListener(
      'input',
      () => {
        this.audio.volume =
          Number(volumeInput.value);
      }
    );

    setChildren(
      volume,
      volumeIcon,
      volumeInput
    );

    setChildren(
      player,
      trackInformation,
      controls,
      timeline,
      volume
    );

    return player;
  }

  playTrack(track: Track): void {
    const index = this.tracks.findIndex(
      (item: Track) =>
        item.id === track.id
    );

    this.currentIndex = index;

    this.updateTrack(track);

    const audioUrl =
      track.audioUrl ??
      track.url;

    if (!audioUrl) {
      this.currentTimeElement.textContent =
        'Нет аудиофайла';

      return;
    }

    if (this.audio.src !== audioUrl) {
      this.audio.src = audioUrl;
    }

    void this.audio.play().catch(() => {
      this.playButton.textContent = '▶';
    });
  }

  private updateTrack(track: Track): void {
    this.titleElement.textContent =
      track.title;

    this.artistElement.textContent =
      track.artist;

    this.favoriteButton.textContent =
      this.options.isFavorite(track.id)
        ? '♥'
        : '♡';

    this.favoriteButton.classList.toggle(
      'player__favorite--active',
      this.options.isFavorite(track.id)
    );

    const imageUrl =
      track.cover ??
      track.image;

    this.coverElement.replaceChildren();

    if (imageUrl) {
      const image = el(
        'img.player__cover-image'
      ) as HTMLImageElement;

      image.src = imageUrl;
      image.alt = track.title;

      this.coverElement.appendChild(
        image
      );
    } else {
      this.coverElement.textContent =
        '♫';
    }
  }

  private setupEvents(): void {
    this.audio.addEventListener(
      'timeupdate',
      () => {
        this.updateProgress();
      }
    );

    this.audio.addEventListener(
      'loadedmetadata',
      () => {
        this.durationElement.textContent =
          formatTime(this.audio.duration);

        this.progress.max =
          String(this.audio.duration);
      }
    );

    this.audio.addEventListener(
      'play',
      () => {
        this.playButton.textContent =
          '⏸';
      }
    );

    this.audio.addEventListener(
      'pause',
      () => {
        this.playButton.textContent =
          '▶';
      }
    );

    this.audio.addEventListener(
      'ended',
      () => {
        this.next();
      }
    );

    this.progress.addEventListener(
      'input',
      () => {
        this.audio.currentTime =
          Number(this.progress.value);
      }
    );

    this.favoriteButton.addEventListener(
      'click',
      () => {
        const track =
          this.tracks[this.currentIndex];

        if (track) {
          this.options.onFavorite(track);
        }
      }
    );

    window.addEventListener(
      'keydown',
      (event: KeyboardEvent) => {
        if (
          event.target instanceof
          HTMLInputElement
        ) {
          return;
        }

        if (
          event.code === 'Space'
        ) {
          event.preventDefault();
          void this.togglePlay();
        }

        if (event.code === 'ArrowLeft') {
          this.seek(-10);
        }

        if (event.code === 'ArrowRight') {
          this.seek(10);
        }

        if (
          event.key.toLowerCase() === 'n'
        ) {
          this.next();
        }

        if (
          event.key.toLowerCase() === 'p'
        ) {
          this.previous();
        }
      }
    );
  }

  private async togglePlay(): Promise<void> {
    if (!this.audio.src) {
      return;
    }

    if (this.audio.paused) {
      await this.audio.play();
    } else {
      this.audio.pause();
    }
  }

  private seek(seconds: number): void {
    if (!this.audio.src) {
      return;
    }

    const newTime =
      this.audio.currentTime + seconds;

    this.audio.currentTime = Math.max(
      0,
      Math.min(
        newTime,
        this.audio.duration || Infinity
      )
    );
  }

  private next(): void {
    if (
      this.tracks.length === 0
    ) {
      return;
    }

    const nextIndex =
      this.currentIndex + 1;

    if (
      nextIndex >= this.tracks.length
    ) {
      this.currentIndex = 0;
    } else {
      this.currentIndex = nextIndex;
    }

    const track =
      this.tracks[this.currentIndex];

    if (track) {
      this.playTrack(track);
    }
  }

  private previous(): void {
    if (
      this.tracks.length === 0
    ) {
      return;
    }

    const previousIndex =
      this.currentIndex - 1;

    if (previousIndex < 0) {
      this.currentIndex =
        this.tracks.length - 1;
    } else {
      this.currentIndex =
        previousIndex;
    }

    const track =
      this.tracks[this.currentIndex];

    if (track) {
      this.playTrack(track);
    }
  }

  private updateProgress(): void {
    this.progress.value =
      String(this.audio.currentTime);

    this.currentTimeElement.textContent =
      formatTime(
        this.audio.currentTime
      );
  }
}
