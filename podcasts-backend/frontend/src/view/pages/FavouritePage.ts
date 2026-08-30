import {
  trackService,
  type Track,
} from '../../services/trackService';

import { favoriteService } from '../../services/favoriteService';
import { playerService } from '../../services/playerService';

export class FavouritePage {
  private root: HTMLElement;

  private tracks: Track[] = [];

  private unsubscribePlayer:
    (() => void) | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  async render(): Promise<void> {
    this.unsubscribePlayer?.();

    this.root.innerHTML = `
      <section class="favourite-page">

        <div class="page-heading">
          <span class="page-heading__eyebrow">
            YOUR COLLECTION
          </span>

          <h1>Избранное</h1>

          <p>
            Здесь находятся треки, которые вы сохранили.
          </p>
        </div>

        <div
          id="favourite-state"
          class="tracks-state"
        >
          <div class="page-loading">
            <div class="loader"></div>
            <span>
              Загрузка избранного...
            </span>
          </div>
        </div>

        <div
          id="favourite-grid"
          class="tracks-grid"
        ></div>
      </section>

      <div
        id="favourite-player"
        class="audio-player audio-player--hidden"
      >
        <div class="audio-player__cover">
          <img
            id="favourite-player-cover"
            src=""
            alt=""
          />
        </div>

        <div class="audio-player__info">
          <strong id="favourite-player-title">
            —
          </strong>

          <span id="favourite-player-artist">
            —
          </span>
        </div>

        <button
          id="favourite-player-play"
          class="player-button"
          type="button"
          aria-label="Воспроизвести"
        >
          ▶
        </button>

        <div class="player-progress">
          <span id="favourite-current-time">
            00:00
          </span>

          <input
            id="favourite-progress"
            type="range"
            min="0"
            max="100"
            value="0"
            step="0.1"
          />

          <span id="favourite-duration">
            00:00
          </span>
        </div>

        <div class="player-volume">
          <span>🔊</span>

          <input
            id="favourite-volume"
            type="range"
            min="0"
            max="1"
            value="1"
            step="0.01"
          />
        </div>
      </div>
    `;

    this.bindEvents();

    const volume =
      this.root.querySelector<HTMLInputElement>(
        '#favourite-volume',
      );

    if (volume) {
      volume.value = String(
        playerService.getVolume(),
      );
    }

    this.unsubscribePlayer =
      playerService.subscribe(() => {
        this.updatePlayer();
      });

    await this.loadFavorites();
  }

  private async loadFavorites(): Promise<void> {
    try {
      const allTracks =
        await trackService.getTracks();

      this.tracks =
        await favoriteService.getFavoriteTracks(
          allTracks,
        );

      this.renderTracks();
      this.updatePlayer();
    } catch (error) {
      this.renderError(error);
    }
  }

  private renderTracks(): void {
    const grid =
      this.root.querySelector<HTMLElement>(
        '#favourite-grid',
      );

    const state =
      this.root.querySelector<HTMLElement>(
        '#favourite-state',
      );

    if (!grid || !state) {
      return;
    }

    state.innerHTML = '';

    if (this.tracks.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">

          <div class="empty-state__icon">
            ♡
          </div>

          <h2>
            Избранное пока пусто
          </h2>

          <p>
            Добавьте понравившиеся треки
            с главной страницы.
          </p>

          <button
            id="go-home"
            class="primary-button"
            type="button"
          >
            Найти музыку
          </button>

        </div>
      `;

      const button =
        this.root.querySelector<HTMLButtonElement>(
          '#go-home',
        );

      button?.addEventListener(
        'click',
        () => {
          window.dispatchEvent(
            new CustomEvent(
              'navigate',
              {
                detail: '/',
              },
            ),
          );
        },
      );

      return;
    }

    grid.innerHTML =
      this.tracks
        .map(
          (track) =>
            this.createTrackCard(track),
        )
        .join('');

    this.bindTrackCards();
  }

  private createTrackCard(
    track: Track,
  ): string {
    const current =
      playerService.getCurrentTrack();

    const isCurrent =
      current !== null &&
      String(current.id) ===
        String(track.id);

    const isPlaying =
      playerService.isPlaying(
        track.id,
      );

    return `
      <article
        class="track-card ${
          isCurrent
            ? 'track-card--active'
            : ''
        }"
        data-track-id="${this.escapeHtml(
          String(track.id),
        )}"
      >

        <div class="track-card__cover">

          ${
            track.cover
              ? `
                <img
                  src="${this.escapeHtml(
                    track.cover,
                  )}"
                  alt="${this.escapeHtml(
                    track.title,
                  )}"
                  loading="lazy"
                />
              `
              : `
                <div class="track-card__placeholder">
                  ♪
                </div>
              `
          }

          <button
            class="track-card__play"
            data-action="play"
            type="button"
            aria-label="${
              isCurrent && isPlaying
                ? 'Пауза'
                : 'Воспроизвести'
            }"
          >
            ${
              isCurrent && isPlaying
                ? '❚❚'
                : '▶'
            }
          </button>

        </div>

        <div class="track-card__body">

          <div class="track-card__main">
            <h3>
              ${this.escapeHtml(
                track.title,
              )}
            </h3>

            <p>
              ${this.escapeHtml(
                track.artist,
              )}
            </p>
          </div>

          <button
            class="track-card__favorite
              track-card__favorite--active"
            data-action="favorite"
            type="button"
            aria-label="Удалить из избранного"
          >
            ♥
          </button>

        </div>

        <div class="track-card__footer">

          <span>
            ${
              track.album
                ? this.escapeHtml(
                    track.album,
                  )
                : 'Single'
            }
          </span>

          <span>
            ${this.escapeHtml(
              track.durationFormatted ??
                '00:00',
            )}
          </span>

        </div>

      </article>
    `;
  }

  private bindTrackCards(): void {
    const cards =
      this.root.querySelectorAll<HTMLElement>(
        '.track-card',
      );

    cards.forEach((card) => {
      const id =
        card.dataset.trackId;

      if (!id) {
        return;
      }

      const track =
        this.tracks.find(
          (item) =>
            String(item.id) ===
            String(id),
        );

      if (!track) {
        return;
      }

      const play =
        card.querySelector<HTMLButtonElement>(
          '[data-action="play"]',
        );

      play?.addEventListener(
        'click',
        (event) => {
          event.stopPropagation();

          void this.playTrack(track);
        },
      );

      const favorite =
        card.querySelector<HTMLButtonElement>(
          '[data-action="favorite"]',
        );

      favorite?.addEventListener(
        'click',
        (event) => {
          event.stopPropagation();

          void this.removeFavorite(track);
        },
      );
    });
  }

  private async playTrack(
    track: Track,
  ): Promise<void> {
    try {
      await playerService.toggle(
        track,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Не удалось воспроизвести трек.';

      this.showError(message);
    }
  }

  private async removeFavorite(
    track: Track,
  ): Promise<void> {
    try {
      await favoriteService.removeFavorite(
        track.id,
      );

      this.tracks =
        this.tracks.filter(
          (item) =>
            String(item.id) !==
            String(track.id),
        );

      this.renderTracks();
    } catch {
      this.showError(
        'Не удалось удалить трек из избранного.',
      );
    }
  }

  private bindEvents(): void {
    const play =
      this.root.querySelector<HTMLButtonElement>(
        '#favourite-player-play',
      );

    play?.addEventListener(
      'click',
      () => {
        void playerService.toggle();
      },
    );

    const progress =
      this.root.querySelector<HTMLInputElement>(
        '#favourite-progress',
      );

    progress?.addEventListener(
      'input',
      () => {
        playerService.setCurrentTime(
          Number(progress.value),
        );
      },
    );

    const volume =
      this.root.querySelector<HTMLInputElement>(
        '#favourite-volume',
      );

    volume?.addEventListener(
      'input',
      () => {
        playerService.setVolume(
          Number(volume.value),
        );
      },
    );
  }

  private updatePlayer(): void {
    const track =
      playerService.getCurrentTrack();

    const player =
      this.root.querySelector<HTMLElement>(
        '#favourite-player',
      );

    const cover =
      this.root.querySelector<HTMLImageElement>(
        '#favourite-player-cover',
      );

    const title =
      this.root.querySelector<HTMLElement>(
        '#favourite-player-title',
      );

    const artist =
      this.root.querySelector<HTMLElement>(
        '#favourite-player-artist',
      );

    const play =
      this.root.querySelector<HTMLButtonElement>(
        '#favourite-player-play',
      );

    const current =
      this.root.querySelector<HTMLElement>(
        '#favourite-current-time',
      );

    const duration =
      this.root.querySelector<HTMLElement>(
        '#favourite-duration',
      );

    const progress =
      this.root.querySelector<HTMLInputElement>(
        '#favourite-progress',
      );

    if (!player) {
      return;
    }

    if (!track) {
      player.classList.add(
        'audio-player--hidden',
      );

      return;
    }

    player.classList.remove(
      'audio-player--hidden',
    );

    if (cover) {
      if (track.cover) {
        cover.src = track.cover;
        cover.style.display =
          'block';
      } else {
        cover.removeAttribute(
          'src',
        );

        cover.style.display =
          'none';
      }

      cover.alt =
        track.title;
    }

    if (title) {
      title.textContent =
        track.title;
    }

    if (artist) {
      artist.textContent =
        track.artist;
    }

    if (play) {
      const playing =
        playerService.isPlaying();

      play.textContent =
        playing
          ? '❚❚'
          : '▶';

      play.setAttribute(
        'aria-label',
        playing
          ? 'Пауза'
          : 'Воспроизвести',
      );
    }

    if (current) {
      current.textContent =
        this.formatTime(
          playerService.getCurrentTime(),
        );
    }

    if (duration) {
      duration.textContent =
        this.formatTime(
          playerService.getDuration(),
        );
    }

    if (progress) {
      progress.value =
        String(
          playerService.getProgress(),
        );
    }

    this.updateActiveCards();
  }

  private updateActiveCards(): void {
    const current =
      playerService.getCurrentTrack();

    const cards =
      this.root.querySelectorAll<HTMLElement>(
        '.track-card',
      );

    cards.forEach((card) => {
      const id =
        card.dataset.trackId;

      const active =
        current !== null &&
        id !== undefined &&
        String(current.id) ===
          String(id);

      card.classList.toggle(
        'track-card--active',
        active,
      );

      const play =
        card.querySelector<HTMLButtonElement>(
          '[data-action="play"]',
        );

      if (play) {
        play.textContent =
          active &&
          playerService.isPlaying()
            ? '❚❚'
            : '▶';
      }
    });
  }

  private renderError(
    error: unknown,
  ): void {
    const state =
      this.root.querySelector<HTMLElement>(
        '#favourite-state',
      );

    if (!state) {
      return;
    }

    const message =
      error instanceof Error
        ? error.message
        : 'Не удалось загрузить избранное.';

    state.innerHTML = `
      <div class="empty-state">

        <div class="empty-state__icon">
          !
        </div>

        <h2>
          Ошибка загрузки
        </h2>

        <p>
          ${this.escapeHtml(message)}
        </p>

        <button
          id="retry-favourites"
          class="primary-button"
          type="button"
        >
          Повторить
        </button>

      </div>
    `;

    const retry =
      this.root.querySelector<HTMLButtonElement>(
        '#retry-favourites',
      );

    retry?.addEventListener(
      'click',
      () => {
        void this.render();
      },
    );
  }

  private showError(
    message: string,
  ): void {
    const state =
      this.root.querySelector<HTMLElement>(
        '#favourite-state',
      );

    if (!state) {
      return;
    }

    state.innerHTML = `
      <div class="error-message">
        ${this.escapeHtml(message)}
      </div>
    `;

    window.setTimeout(() => {
      state.innerHTML = '';
    }, 3000);
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

    const total =
      Math.floor(seconds);

    const minutes =
      Math.floor(total / 60);

    const remaining =
      total % 60;

    return `${String(minutes).padStart(
      2,
      '0',
    )}:${String(
      remaining,
    ).padStart(2, '0')}`;
  }

  private escapeHtml(
    value: string,
  ): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
}
