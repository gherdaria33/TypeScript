import {
  trackService,
  type Track,
} from '../../services/trackService';

import {
  favoriteService,
} from '../../services/favoriteService';

import {
  playerService,
} from '../../services/playerService';

export class MainPage {
  private root: HTMLElement;

  private tracks: Track[] = [];

  private filteredTracks: Track[] = [];

  private searchQuery = '';

  private unsubscribePlayer:
    | (() => void)
    | null = null;

  private unsubscribeProgress:
    | (() => void)
    | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  async render(): Promise<void> {
    this.cleanup();

    this.root.innerHTML = `
      <section class="main-page">

        <div class="hero">

          <div class="hero__content">

            <span class="hero__eyebrow">
              AUDIO PLAYER
            </span>

            <h1>
              Слушайте музыку,<br />
              которая вам нравится
            </h1>

            <p>
              Найдите любимые треки,
              добавляйте их в избранное
              и создавайте своё
              музыкальное пространство.
            </p>

          </div>

          <div class="hero__decoration"></div>

        </div>

        <div class="search-bar">

          <input
            id="track-search"
            type="search"
            placeholder="Поиск трека или исполнителя..."
            autocomplete="off"
          />

          <button
            id="search-button"
            class="primary-button"
            type="button"
          >
            Найти
          </button>

        </div>

        <div
          id="tracks-state"
          class="tracks-state"
        >
          <div class="page-loading">
            <span class="loader"></span>
            Загружаем треки...
          </div>
        </div>

        <div id="tracks-section"></div>

        <div
          id="audio-player-root"
          class="audio-player-root"
        ></div>

      </section>
    `;

    this.bindSearch();

    try {
      await this.loadTracks();
    } catch (error) {
      this.showError(
        this.getErrorMessage(
          error,
        ),
      );
    }

    this.subscribeToPlayer();

    this.renderPlayer();
  }

  private async loadTracks(): Promise<void> {
    this.tracks =
      await trackService.getTracks();

    this.filteredTracks =
      [...this.tracks];

    playerService.setTracks(
      this.tracks,
    );

    this.hideState();

    this.renderTracks();
  }

  private bindSearch(): void {
    const input =
      this.root.querySelector<HTMLInputElement>(
        '#track-search',
      );

    const button =
      this.root.querySelector<HTMLButtonElement>(
        '#search-button',
      );

    input?.addEventListener(
      'input',
      () => {
        this.searchQuery =
          input.value;

        this.applySearch();
      },
    );

    input?.addEventListener(
      'keydown',
      (event) => {
        if (
          event.key === 'Enter'
        ) {
          this.searchQuery =
            input.value;

          this.applySearch();
        }
      },
    );

    button?.addEventListener(
      'click',
      () => {
        this.searchQuery =
          input?.value ?? '';

        this.applySearch();
      },
    );
  }

  private applySearch(): void {
    this.filteredTracks =
      trackService.search(
        this.tracks,
        this.searchQuery,
      );

    this.renderTracks();
  }

  private renderTracks(): void {
    const section =
      this.root.querySelector<HTMLElement>(
        '#tracks-section',
      );

    if (!section) {
      return;
    }

    if (
      this.filteredTracks.length ===
      0
    ) {
      section.innerHTML = `
        <div class="empty-state">

          <div class="empty-state__icon">
            ♪
          </div>

          <h2>
            Ничего не найдено
          </h2>

          <p>
            По вашему запросу треков
            не найдено. Попробуйте
            изменить поисковый запрос.
          </p>

        </div>
      `;

      return;
    }

    section.innerHTML = `
      <div class="section-heading">

        <h2>
          ${this.searchQuery
            ? 'Результаты поиска'
            : 'Все треки'}
        </h2>

        <span>
          ${this.filteredTracks.length}
          ${
            this.getTrackWord(
              this.filteredTracks.length,
            )
          }
        </span>

      </div>

      <div class="tracks-grid">
        ${this.filteredTracks
          .map(
            (track) =>
              this.renderTrackCard(
                track,
              ),
          )
          .join('')}
      </div>
    `;

    this.bindTrackEvents();
  }

  private renderTrackCard(
    track: Track,
  ): string {
    const isFavorite =
      favoriteService.isFavorite(
        track.id,
      );

    const currentTrack =
      playerService.getCurrentTrack();

    const isCurrent =
      currentTrack !== null &&
      String(
        currentTrack.id,
      ) === String(track.id);

    const isPlaying =
      isCurrent &&
      playerService.isPlaying();

    const cover =
      track.cover;

    return `
      <article
        class="
          track-card
          ${
            isCurrent
              ? 'track-card--active'
              : ''
          }
        "
        data-track-id="${this.escapeAttribute(
          String(track.id),
        )}"
      >

        <div class="track-card__cover">

          ${
            cover
              ? `
                <img
                  src="${this.escapeAttribute(
                    cover,
                  )}"
                  alt="${this.escapeAttribute(
                    track.title,
                  )}"
                  loading="lazy"
                />
              `
              : `
                <div
                  class="track-card__placeholder"
                >
                  ♪
                </div>
              `
          }

          <button
            class="track-card__play"
            data-action="play"
            type="button"
            aria-label="${
              isPlaying
                ? 'Пауза'
                : 'Воспроизвести'
            }"
          >
            ${
              isPlaying
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
            class="
              track-card__favorite
              ${
                isFavorite
                  ? 'track-card__favorite--active'
                  : ''
              }
            "
            data-action="favorite"
            type="button"
            aria-label="${
              isFavorite
                ? 'Удалить из избранного'
                : 'Добавить в избранное'
            }"
          >
            ${
              isFavorite
                ? '♥'
                : '♡'
            }
          </button>

        </div>

        <div class="track-card__footer">

          <span>
            ${
              track.durationFormatted ||
              '—'
            }
          </span>

          ${
            track.album
              ? `
                <span>
                  ${this.escapeHtml(
                    track.album,
                  )}
                </span>
              `
              : ''
          }

        </div>

      </article>
    `;
  }

  private bindTrackEvents(): void {
    const cards =
      this.root.querySelectorAll<HTMLElement>(
        '.track-card',
      );

    cards.forEach(
      (card) => {
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

        const playButton =
          card.querySelector<HTMLButtonElement>(
            '[data-action="play"]',
          );

        playButton?.addEventListener(
          'click',
          async (event) => {
            event.stopPropagation();

            try {
              await playerService.toggle(
                track,
              );

              this.renderTracks();
              this.renderPlayer();
            } catch (error) {
              this.showError(
                this.getErrorMessage(
                  error,
                ),
              );
            }
          },
        );

        const favoriteButton =
          card.querySelector<HTMLButtonElement>(
            '[data-action="favorite"]',
          );

        favoriteButton?.addEventListener(
          'click',
          async (event) => {
            event.stopPropagation();

            try {
              await favoriteService.toggleFavorite(
                track.id,
              );

              this.renderTracks();

              window.dispatchEvent(
                new CustomEvent(
                  'favorites-updated',
                ),
              );
            } catch (error) {
              this.showError(
                this.getErrorMessage(
                  error,
                ),
              );
            }
          },
        );

        card.addEventListener(
          'dblclick',
          async () => {
            try {
              await playerService.play(
                track,
              );

              this.renderTracks();
              this.renderPlayer();
            } catch (error) {
              this.showError(
                this.getErrorMessage(
                  error,
                ),
              );
            }
          },
        );
      },
    );
  }

  private subscribeToPlayer(): void {
    this.unsubscribePlayer =
      playerService.onPlayerChange(
        () => {
          this.renderTracks();
          this.renderPlayer();
        },
      );

    this.unsubscribeProgress =
      playerService.onProgress(
        (
          currentTime,
          duration,
        ) => {
          this.updatePlayerProgress(
            currentTime,
            duration,
          );
        },
      );
  }

  private renderPlayer(): void {
    const root =
      this.root.querySelector<HTMLElement>(
        '#audio-player-root',
      );

    if (!root) {
      return;
    }

    const track =
      playerService.getCurrentTrack();

    if (!track) {
      root.innerHTML = '';

      return;
    }

    const isPlaying =
      playerService.isPlaying();

    const currentTime =
      playerService.getCurrentTime();

    const duration =
      playerService.getDuration();

    const volume =
      playerService.getVolume();

    root.innerHTML = `
      <div
        class="audio-player"
      >

        <div class="audio-player__cover">

          ${
            track.cover
              ? `
                <img
                  src="${this.escapeAttribute(
                    track.cover,
                  )}"
                  alt="${this.escapeAttribute(
                    track.title,
                  )}"
                />
              `
              : `
                <div
                  class="track-card__placeholder"
                >
                  ♪
                </div>
              `
          }

        </div>

        <div class="audio-player__info">

          <strong>
            ${this.escapeHtml(
              track.title,
            )}
          </strong>

          <span>
            ${this.escapeHtml(
              track.artist,
            )}
          </span>

        </div>

        <button
          id="player-previous"
          class="player-button"
          type="button"
          aria-label="Предыдущий трек"
        >
          ◀
        </button>

        <button
          id="player-toggle"
          class="player-button"
          type="button"
          aria-label="${
            isPlaying
              ? 'Пауза'
              : 'Воспроизвести'
          }"
        >
          ${
            isPlaying
              ? '❚❚'
              : '▶'
          }
        </button>

        <button
          id="player-next"
          class="player-button"
          type="button"
          aria-label="Следующий трек"
        >
          ▶
        </button>

        <div class="player-progress">

          <span id="player-current-time">
            ${this.formatTime(
              currentTime,
            )}
          </span>

          <input
            id="player-progress-input"
            type="range"
            min="0"
            max="100"
            value="${
              duration
                ? (
                    currentTime /
                    duration
                  ) * 100
                : 0
            }"
            step="0.1"
            aria-label="Прогресс"
          />

          <span id="player-duration">
            ${this.formatTime(
              duration,
            )}
          </span>

        </div>

        <div class="player-volume">

          <span>
            🔊
          </span>

          <input
            id="player-volume-input"
            type="range"
            min="0"
            max="1"
            value="${volume}"
            step="0.01"
            aria-label="Громкость"
          />

        </div>

      </div>
    `;

    this.bindPlayerEvents();
  }

  private bindPlayerEvents(): void {
    const toggle =
      this.root.querySelector<HTMLButtonElement>(
        '#player-toggle',
      );

    toggle?.addEventListener(
      'click',
      async () => {
        try {
          await playerService.toggle();

          this.renderTracks();
          this.renderPlayer();
        } catch (error) {
          this.showError(
            this.getErrorMessage(
              error,
            ),
          );
        }
      },
    );

    const previous =
      this.root.querySelector<HTMLButtonElement>(
        '#player-previous',
      );

    previous?.addEventListener(
      'click',
      async () => {
        try {
          await playerService.previous();

          this.renderTracks();
          this.renderPlayer();
        } catch (error) {
          this.showError(
            this.getErrorMessage(
              error,
            ),
          );
        }
      },
    );

    const next =
      this.root.querySelector<HTMLButtonElement>(
        '#player-next',
      );

    next?.addEventListener(
      'click',
      async () => {
        try {
          await playerService.next();

          this.renderTracks();
          this.renderPlayer();
        } catch (error) {
          this.showError(
            this.getErrorMessage(
              error,
            ),
          );
        }
      },
    );

    const progress =
      this.root.querySelector<HTMLInputElement>(
        '#player-progress-input',
      );

    progress?.addEventListener(
      'input',
      () => {
        const value =
          Number(
            progress.value,
          );

        playerService.seekPercent(
          value,
        );
      },
    );

    const volume =
      this.root.querySelector<HTMLInputElement>(
        '#player-volume-input',
      );

    volume?.addEventListener(
      'input',
      () => {
        playerService.setVolume(
          Number(
            volume.value,
          ),
        );
      },
    );
  }

  private updatePlayerProgress(
    currentTime: number,
    duration: number,
  ): void {
    const current =
      this.root.querySelector<HTMLElement>(
        '#player-current-time',
      );

    const total =
      this.root.querySelector<HTMLElement>(
        '#player-duration',
      );

    const progress =
      this.root.querySelector<HTMLInputElement>(
        '#player-progress-input',
      );

    if (current) {
      current.textContent =
        this.formatTime(
          currentTime,
        );
    }

    if (total) {
      total.textContent =
        this.formatTime(
          duration,
        );
    }

    if (
      progress &&
      document.activeElement !==
        progress
    ) {
      progress.value =
        duration > 0
          ? String(
              (
                currentTime /
                duration
              ) *
                100,
            )
          : '0';
    }
  }

  private hideState(): void {
    const state =
      this.root.querySelector<HTMLElement>(
        '#tracks-state',
      );

    if (state) {
      state.innerHTML = '';
    }
  }

  private showError(
    message: string,
  ): void {
    const state =
      this.root.querySelector<HTMLElement>(
        '#tracks-state',
      );

    if (!state) {
      return;
    }

    state.innerHTML = `
      <div class="error-message">
        ${this.escapeHtml(
          message,
        )}
      </div>
    `;
  }

  private cleanup(): void {
    if (
      this.unsubscribePlayer
    ) {
      this.unsubscribePlayer();
      this.unsubscribePlayer =
        null;
    }

    if (
      this.unsubscribeProgress
    ) {
      this.unsubscribeProgress();
      this.unsubscribeProgress =
        null;
    }
  }

  private getTrackWord(
    count: number,
  ): string {
    const mod10 =
      count % 10;

    const mod100 =
      count % 100;

    if (
      mod10 === 1 &&
      mod100 !== 11
    ) {
      return 'трек';
    }

    if (
      mod10 >= 2 &&
      mod10 <= 4 &&
      (
        mod100 < 10 ||
        mod100 >= 20
      )
    ) {
      return 'трека';
    }

    return 'треков';
  }

  private formatTime(
    seconds: number,
  ): string {
    if (
      !Number.isFinite(
        seconds,
      ) ||
      seconds < 0
    ) {
      return '00:00';
    }

    const total =
      Math.floor(seconds);

    const minutes =
      Math.floor(
        total / 60,
      );

    const remaining =
      total % 60;

    return `${String(
      minutes,
    ).padStart(
      2,
      '0',
    )}:${String(
      remaining,
    ).padStart(
      2,
      '0',
    )}`;
  }

  private escapeHtml(
    value: string,
  ): string {
    return value
      .replace(
        /&/g,
        '&amp;',
      )
      .replace(
        /</g,
        '&lt;',
      )
      .replace(
        />/g,
        '&gt;',
      )
      .replace(
        /"/g,
        '&quot;',
      )
      .replace(
        /'/g,
        '&#039;',
      );
  }

  private escapeAttribute(
    value: string,
  ): string {
    return this.escapeHtml(
      value,
    );
  }

  private getErrorMessage(
    error: unknown,
  ): string {
    if (
      error instanceof Error
    ) {
      return error.message;
    }

    return 'Произошла ошибка. Попробуйте ещё раз.';
  }
}
