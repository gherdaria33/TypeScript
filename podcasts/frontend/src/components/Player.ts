import { el } from 'redom';

import { playerService } from '../services/playerService';
import { favoriteService } from '../services/favoriteService';
import { authService } from '../services/authService';

import type { Track } from '../types';

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

/**
 * Создание SVG/IMG иконки.
 * Используется только для остальных кнопок.
 * Play/Pause работают через обычные эмодзи.
 */
function createIcon(
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

/**
 * Получение обложки трека.
 */
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

  if (item.cover) {
    return item.cover;
  }

  if (item.coverUrl) {
    return item.coverUrl;
  }

  if (item.image) {
    return item.image;
  }

  if (item.imageUrl) {
    return item.imageUrl;
  }

  const id = Number(track.id) || 1;

  const number = ((id - 1) % 6) + 1;

  return `/covers/track${number}.svg`;
}

export class Player {
  public readonly el: HTMLElement;

  private readonly cover: HTMLImageElement;

  private readonly title: HTMLElement;

  private readonly artist: HTMLElement;

  private readonly playButton: HTMLButtonElement;

  private readonly currentTime: HTMLElement;

  private readonly duration: HTMLElement;

  private readonly range: HTMLInputElement;

  private readonly volumeRange: HTMLInputElement;

  private readonly volumeIcon: HTMLElement;

  private readonly shuffleButton: HTMLButtonElement;

  private readonly repeatButton: HTMLButtonElement;

  private readonly favoriteButton: HTMLButtonElement;

  private favorites = new Set<number>();

  constructor() {
    const audio = playerService.getAudio();

    // ==================================================
    // COVER
    // ==================================================

    this.cover = el(
      'img.player__cover',
      {
        src: '/covers/track1.svg',
        alt: 'Обложка трека',
        draggable: false,
      }
    ) as HTMLImageElement;

    // ==================================================
    // TITLE
    // ==================================================

    this.title = el(
      'div.player__title',
      'Выберите композицию'
    ) as HTMLElement;

    // ==================================================
    // ARTIST
    // ==================================================

    this.artist = el(
      'div.player__artist',
      '—'
    ) as HTMLElement;

    // ==================================================
    // FAVORITE
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

      '♡'
    ) as HTMLButtonElement;

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

      createIcon(
        '/covers/Shuffle.svg',
        'Перемешать'
      )
    ) as HTMLButtonElement;

    // ==================================================
    // REWIND
    // ==================================================

    const rewindButton = el(
      'button.player__button',
      {
        type: 'button',

        title: 'Назад на 10 секунд',

        'aria-label': 'Назад на 10 секунд',

        onclick: () => {
          playerService.seek(-10);
        },
      },

      createIcon(
        '/covers/SkipBack.svg',
        'Назад'
      )
    ) as HTMLButtonElement;

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
            .catch((error: unknown) => {
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

        title: 'Вперёд на 10 секунд',

        'aria-label': 'Вперёд на 10 секунд',

        onclick: () => {
          playerService.seek(10);
        },
      },

      createIcon(
        '/covers/SkipForward.svg',
        'Вперёд'
      )
    ) as HTMLButtonElement;

    // ==================================================
    // REPEAT
    // ==================================================

    this.repeatButton = el(
      'button.player__button.player__repeat',
      {
        type: 'button',

        title: 'Повторять трек',

        'aria-label': 'Повторять трек',

        'aria-pressed': 'false',

        onclick: () => {
          const active =
            playerService.toggleRepeat();

          this.repeatButton.classList.toggle(
            'player__button--active',
            active
          );

          this.repeatButton.setAttribute(
            'aria-pressed',
            String(active)
          );
        },
      },

      createIcon(
        '/covers/Repeat.svg',
        'Повторять'
      )
    ) as HTMLButtonElement;

    // ==================================================
    // CURRENT TIME
    // ==================================================

    this.currentTime = el(
      'span.player__time',
      '0:00'
    ) as HTMLElement;

    // ==================================================
    // DURATION
    // ==================================================

    this.duration = el(
      'span.player__time',
      '0:00'
    ) as HTMLElement;

    // ==================================================
    // PROGRESS RANGE
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
          const value = Number(
            this.volumeRange.value
          );

          playerService.setVolume(value);

          this.updateVolumeIcon(value);
        },
      }
    ) as HTMLInputElement;

    // ==================================================
    // AUDIO TIME UPDATE
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

          this.range.value = String(
            (audio.currentTime /
              audio.duration) *
              100
          );
        }
      }
    );

    // ==================================================
    // METADATA
    // ==================================================

    audio.addEventListener(
      'loadedmetadata',
      () => {
        this.duration.textContent =
          formatTime(audio.duration);
      }
    );

    // ==================================================
    // VOLUME EVENT
    // ==================================================

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
          // Название
          this.title.textContent =
            track.title || 'Без названия';

          // Исполнитель
          this.artist.textContent =
            track.artist ||
            'Неизвестный исполнитель';

          // Обложка
          this.cover.src =
            getCover(track);

          this.cover.alt =
            track.album ||
            track.title ||
            'Обложка';

          // Сбрасываем время при новом треке
          this.currentTime.textContent =
            '0:00';

          this.duration.textContent =
            '0:00';

          this.range.value = '0';

          // Обновляем сердце
          this.updateFavorite(track.id);
        }

        // ==================================================
        // PLAY / PAUSE EMOJI
        // ==================================================

        this.playButton.textContent =
          playing ? '⏸' : '▶';

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

        // ==================================================
        // SHUFFLE
        // ==================================================

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
        // LEFT
        el(
          'div.player__info',
          [
            this.cover,

            el(
              'div.player__track-info',
              [
                // Название + сердце В ОДНОЙ СТРОКЕ
                el(
                  'div.player__title-row',
                  [
                    this.title,
                    this.favoriteButton,
                  ]
                ),

                this.artist,
              ]
            ),
          ]
        ),

        // CENTER
        el(
          'div.player__controls',
          [
            // BUTTONS
            el(
              'div.player__buttons',
              [
                this.shuffleButton,

                rewindButton,

                this.playButton,

                forwardButton,

                this.repeatButton,
              ]
            ),

            // TIMELINE
            el(
              'div.player__timeline',
              [
                this.currentTime,

                this.range,

                this.duration,

                // VOLUME
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
    // LOAD FAVORITES
    // ==================================================

    void this.loadFavorites();
  }

  // ====================================================
  // LOAD FAVORITES
  // ====================================================

  private async loadFavorites(): Promise<void> {
    if (!authService.isAuthenticated()) {
      this.favorites.clear();
      return;
    }

    try {
      const tracks =
        await favoriteService.getFavorites();

      this.favorites = new Set(
        tracks.map(
          (track) => Number(track.id)
        )
      );

      const current =
        playerService.getCurrent();

      if (current) {
        this.updateFavorite(
          Number(current.id)
        );
      }
    } catch (error) {
      console.error(
        'Не удалось загрузить избранное:',
        error
      );
    }
  }

  // ====================================================
  // TOGGLE FAVORITE
  // ====================================================

  private async toggleFavorite(): Promise<void> {
    const track =
      playerService.getCurrent();

    if (!track) {
      return;
    }

    if (!authService.isAuthenticated()) {
      console.error(
        'Необходима авторизация'
      );

      return;
    }

    const trackId =
      Number(track.id);

    const isFavorite =
      this.favorites.has(trackId);

    this.favoriteButton.disabled = true;

    try {
      if (isFavorite) {
        // DELETE /api/favorites
        await favoriteService.remove(
          trackId
        );

        this.favorites.delete(
          trackId
        );
      } else {
        // POST /api/favorites
        await favoriteService.add(
          trackId
        );

        this.favorites.add(
          trackId
        );
      }

      // Меняем сердце только после
      // успешного ответа сервера.
      this.updateFavorite(trackId);
    } catch (error) {
      console.error(
        'Ошибка избранного:',
        error
      );
    } finally {
      this.favoriteButton.disabled = false;
    }
  }

  // ====================================================
  // UPDATE FAVORITE
  // ====================================================

  private updateFavorite(
    trackId: number
  ): void {
    const active =
      this.favorites.has(
        Number(trackId)
      );

    this.favoriteButton.textContent =
      active ? '❤' : '♡';

    this.favoriteButton.classList.toggle(
      'player__favorite--active',
      active
    );

    this.favoriteButton.setAttribute(
      'aria-label',
      active
        ? 'Убрать из избранного'
        : 'Добавить в избранное'
    );

    this.favoriteButton.title =
      active
        ? 'Убрать из избранного'
        : 'Добавить в избранное';
  }

  // ====================================================
  // SHUFFLE
  // ====================================================

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

  // ====================================================
  // VOLUME ICON
  // ====================================================

  private updateVolumeIcon(
    value: number
  ): void {
    if (value <= 0) {
      this.volumeIcon.textContent =
        '🔇';

      return;
    }

    if (value < 0.5) {
      this.volumeIcon.textContent =
        '🔉';

      return;
    }

    this.volumeIcon.textContent =
      '🔊';
  }
}