import { el } from 'redom';
import { playerService } from '../services/playerService';
import type { Track } from '../types';
import { favoriteService } from '../services/favoriteService';
import { authService } from '../services/authService';

function formatTime(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    return '0:00';
  }

  const minutes = Math.floor(value / 60);

  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, '0');

  return `${minutes}:${seconds}`;
}

function getCover(track: Track | null): string {
  if (!track) {
    return '/covers/track1.svg';
  }

  const item = track as Track & {
    cover?: string;
    coverUrl?: string;
    image?: string;
    imageUrl?: string;
  };

  if (item.cover) return item.cover;
  if (item.coverUrl) return item.coverUrl;
  if (item.image) return item.image;
  if (item.imageUrl) return item.imageUrl;

  const id = Number(track.id) || 1;
  const number = ((id - 1) % 6) + 1;

  return `/covers/track${number}.svg`;
}

function icon(
  src: string,
  alt: string
): HTMLImageElement {
  return el(
    'img.player__button-icon',
    {
      src,
      alt,
      draggable: false,
    }
  ) as HTMLImageElement;
}

export class Player {
  public readonly el: HTMLElement;

  private readonly cover: HTMLImageElement;
  private readonly title: HTMLElement;
  private readonly favoriteButton: HTMLButtonElement;
  private readonly artist: HTMLElement;

  private readonly playButton: HTMLButtonElement;

  private readonly currentTime: HTMLElement;
  private readonly duration: HTMLElement;
  private readonly range: HTMLInputElement;

  private readonly shuffleButton: HTMLButtonElement;

  private readonly volumeRange: HTMLInputElement;
  private readonly volumeIcon: HTMLElement;

  constructor() {
    const audio = playerService.getAudio();

    // ==================================================
    // ОБЛОЖКА
    // ==================================================

    this.cover = el(
      'img.player__cover',
      {
        src: '/covers/track1.svg',
        alt: 'Обложка трека',
      }
    ) as HTMLImageElement;

    // ==================================================
    // НАЗВАНИЕ
    // ==================================================

    this.title = el(
      'div.player__title',
      'Выберите композицию'
    ) as HTMLElement;

    // ==================================================
    // ИСПОЛНИТЕЛЬ
    // ==================================================

   this.favoriteButton = el(
  'button.player__favorite',
  {
      type: 'button',
    'aria-label': 'Добавить в избранное',
    title: 'Добавить в избранное',

    onclick: (event: Event) => {
      event.preventDefault();
      event.stopPropagation();

      void this.toggleFavorite();
    },
  },
  '❤'
) as HTMLButtonElement;

    this.artist = el(
      'div.player__artist',
      '—'
    ) as HTMLElement;

    // ==================================================
    // PREVIOUS
    // ==================================================

    const previousButton = el(
      'button.player__button',
      {
      type: 'button',
      title: 'Предыдущий трек',
        'aria-label': 'Предыдущий трек',

        onclick: () => {
          playerService.previous();
        },
      },

      icon(
        '/covers/SkipBack.svg',
        'Предыдущий трек'
      )
    ) as HTMLButtonElement;

    // ==================================================
    // REWIND
    // ==================================================

    const rewindButton = el(
      'button.player__button',
      {
        type: 'button',
        title: 'Перемотать назад',
        'aria-label': 'Перемотать назад',

        onclick: () => {
          playerService.seek(-10);
        },
      },

      icon(
        '/covers/SkipBack.svg',
        'Перемотать назад'
      )
    ) as HTMLButtonElement;

    // ==================================================
    // PLAY / PAUSE
    // ==================================================

    // ==================================================
// PLAY / PAUSE
// ==================================================

this.playButton = el(
  'button.player__button.player__button--play',
  {
    type: 'button',
    title: 'Воспроизвести',
    'aria-label': 'Воспроизвести',

    onclick: () => {
      void playerService
        .toggle()
        .catch((error) => {
          if (
            error instanceof DOMException &&
            error.name === 'AbortError'
          ) {
            return;
          }

          console.error(
            'Ошибка воспроизведения:',
            error
          );
        });
    },
  },

  '▶️'
) as HTMLButtonElement;

    // ==================================================
    // FORWARD
    // ==================================================

    const forwardButton = el(
      'button.player__button',
      {
        type: 'button',
        title: 'Перемотать вперёд',
        'aria-label': 'Перемотать вперёд',

        onclick: () => {
          playerService.seek(10);
        },
      },

      icon(
        '/covers/Skip.svg',
        'Перемотать вперёд'
      )
    ) as HTMLButtonElement;

    // ==================================================
    // NEXT
    // ==================================================

    const nextButton = el(
      'button.player__button',
      {
      type: 'button',
      title: 'Следующий трек',
        'aria-label': 'Следующий трек',

        onclick: () => {
          playerService.next();
        },
      },

      icon(
        '/covers/Skip.svg',
        'Следующий трек'
      )
    ) as HTMLButtonElement;

    // ==================================================
    // SHUFFLE
    // ==================================================

    this.shuffleButton = el(
      'button.player__button.player__shuffle',
      {
      type: 'button',
        title: 'Случайный порядок',
        'aria-label': 'Случайный порядок',
        'aria-pressed': 'false',

        onclick: () => {
          const active =
            playerService.toggleShuffle();

          this.updateShuffle(active);
        },
      },

      icon(
        '/covers/Shuffle.svg',
        'Случайный порядок'
      )
    ) as HTMLButtonElement;

    // ==================================================
    // TIME
    // ==================================================

    this.currentTime = el(
      'span.player__time',
      '0:00'
    ) as HTMLElement;

    this.duration = el(
      'span.player__time',
      '0:00'
    ) as HTMLElement;

    // ==================================================
    // PROGRESS
    // ==================================================

    this.range = el(
      'input.player__range',
      {
      type: 'range',
      min: '0',
      max: '100',
      value: '0',
      step: '0.1',
        'aria-label': 'Позиция трека',

        oninput: () => {
          playerService.seekTo(
            Number(this.range.value) / 100
          );
        },
      }
    ) as HTMLInputElement;

    // ==================================================
    // VOLUME
    // ==================================================

    this.volumeIcon = el(
      'span.player__volume-icon',
      '🔊'
    ) as HTMLElement;

    this.volumeRange = el(
      'input.player__volume-range',
      {
        type: 'range',
        min: '0',
        max: '1',
        step: '0.01',
        value: String(audio.volume),
        'aria-label': 'Громкость',

        oninput: () => {
          const value =
            Number(this.volumeRange.value);

          audio.volume = value;

          this.updateVolumeIcon(value);
        },
      }
    ) as HTMLInputElement;

    // ==================================================
    // AUDIO EVENTS
    // ==================================================

    audio.addEventListener(
      'timeupdate',
      () => {
        this.currentTime.textContent =
          formatTime(audio.currentTime);

        if (
          Number.isFinite(audio.duration) &&
          audio.duration > 0
        ) {
          this.duration.textContent =
            formatTime(audio.duration);

          this.range.value =
            String(
              (audio.currentTime /
                audio.duration) *
                100
            );
      }
      }
    );

    audio.addEventListener(
      'loadedmetadata',
      () => {
        this.duration.textContent =
          formatTime(audio.duration);
      }
    );

    audio.addEventListener(
      'volumechange',
      () => {
        this.volumeRange.value =
          String(audio.volume);

        this.updateVolumeIcon(
          audio.volume
        );
      }
    );

    // ==================================================
    // PLAYER STATE
    // ==================================================

    playerService.subscribe(
  (
    track: Track | null,
    playing: boolean
  ) => {
      if (track) {
      this.title.textContent =
        track.title || 'Без названия';

      this.artist.textContent =
        track.artist ||
        'Неизвестный исполнитель';

      this.cover.src =
        getCover(track);

      this.cover.alt =
        track.album ||
        track.title ||
        'Обложка';

      this.currentTime.textContent =
        '0:00';

      this.duration.textContent =
        '0:00';

      this.range.value = '0';
    }


    this.playButton.textContent =
      playing ? '⏸ ' : '▶';

    this.playButton.setAttribute(
      'aria-label',
      playing
        ? 'Пауза'
        : 'Воспроизвести'
    );

    this.playButton.title =
      playing
        ? 'Пауза'
        : 'Воспроизвести';

    this.updateShuffle(
      playerService.isShuffle()
    );
  }
);

    // ==================================================
    // HTML
    // ==================================================

    this.el = el(
      'footer.player',
      [
        el(
          'div.player__info',
          [
            this.cover,

            el(
          'div.player__track-info',
          [
           el(
             'div.player__title-row',
             [
                this.title,
               this.favoriteButton,
              ]
             ),
             this.artist,
            ]
           )
          ]
        ),

        el(
          'div.player__controls',
          [
            el(
              'div.player__buttons',
              [
                previousButton,
                rewindButton,
                this.playButton,
                forwardButton,
                nextButton,
                this.shuffleButton,
              ]
            ),

            el(
              'div.player__timeline',
              [
          this.currentTime,

          this.range,

                this.duration,

                el(
                  'div.player__volume',
                  [
                    this.volumeIcon,
                    this.volumeRange,
                  ]
                ),
              ]
            ),
          ]
        ),
      ]
    ) as HTMLElement;

    // ==================================================
    // KEYBOARD
    // ==================================================

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
          event.code === 'ArrowLeft'
        ) {
          playerService.seek(-10);
        }

        if (
          event.code === 'ArrowRight'
        ) {
          playerService.seek(10);
        }

        if (
          event.code === 'Space'
        ) {
        event.preventDefault();

          void playerService
            .toggle()
            .catch((error) => {
              if (
                error instanceof DOMException &&
                error.name === 'AbortError'
              ) {
                return;
      }

              console.error(
                'Ошибка воспроизведения:',
                error
              );
            });
        }
      }
    );
  }

  private updateShuffle(
    active: boolean
  ): void {
    this.shuffleButton.classList.toggle(
      'player__shuffle--active',
      active
    );

    this.shuffleButton.setAttribute(
      'aria-pressed',
      String(active)
    );
  }

  private updateVolumeIcon(
    value: number
  ): void {
    if (value <= 0) {
      this.volumeIcon.textContent = '🔇';
      return;
    }

    if (value < 0.5) {
      this.volumeIcon.textContent = '🔉';
      return;
    }

    this.volumeIcon.textContent = '🔊';
  }

 private async toggleFavorite(): Promise<void> {
  const track = playerService.getCurrent();

  if (!track) {
    console.log('Трек не выбран');
    return;
  }

  if (!authService.isAuthenticated()) {
    console.log('Пользователь не авторизован');
    return;
  }

  const active =
      this.favoriteButton.classList.contains(
        'player__favorite--active'
      );

  try {
    if (active) {
      await favoriteService.remove(track.id);

      this.favoriteButton.textContent = '(❤';

      this.favoriteButton.classList.remove(
        'player__favorite--active'
      );
    } else {
      await favoriteService.add(track.id);

      this.favoriteButton.textContent = '♥';

      this.favoriteButton.classList.add(
        'player__favorite--active'
      );
    }
  } catch (error) {
    console.error(
      'Ошибка избранного:',
      error
    );
  }
  }
}