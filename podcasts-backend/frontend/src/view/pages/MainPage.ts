import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import { TrackCard } from '../../components/TrackCard';
import { AudioPlayer } from '../../components/AudioPlayer';

import { TrackService } from '../../services/trackService';
import type { Track } from '../../types/track';
import type { Router } from '../../router/Router';

export class MainPage {
  private readonly root: HTMLElement;
  private readonly router: Router;
  private readonly token: string;
  private readonly username: string;

  private readonly trackService: TrackService;

  private tracks: Track[] = [];
  private filteredTracks: Track[] = [];
  private favoriteIds: Set<string> =
    new Set<string>();

  private currentTrackId:
    string | null = null;

  private audioPlayer:
    AudioPlayer | null = null;

  public constructor(
    root: HTMLElement,
    router: Router,
    token: string,
    username: string,
  ) {
    this.root = root;
    this.router = router;
    this.token = token;
    this.username = username;

    this.trackService =
      new TrackService();
  }

  public async render(): Promise<void> {
    this.root.innerHTML = '';

    const layout =
      document.createElement('div');

    layout.className =
      'app-layout';

    const sidebar =
      document.createElement('aside');

    sidebar.className =
      'app-layout__sidebar';

    const main =
      document.createElement('div');

    main.className =
      'app-layout__main';

    const header =
      document.createElement('div');

    header.className =
      'app-layout__header';

    const content =
      document.createElement('main');

    content.className =
      'app-layout__content';

    layout.append(
      sidebar,
      main,
    );

    main.append(
      header,
      content,
    );

    this.root.append(
      layout,
    );

    this.createSidebar(
      sidebar,
    );

    this.createHeader(
      header,
      content,
    );

    this.createPlayer();

    await this.loadTracks(
      content,
    );
  }

  private createSidebar(
    container: HTMLElement,
  ): void {
    const sidebar =
      new Sidebar({
        currentRoute: '/favprites',
        onNavigate:
          (route) => {
            this.router.navigate(
              route,
            );
          },
      });

    sidebar.render(
      container,
    );
  }

  private createHeader(
    container: HTMLElement,
    content: HTMLElement,
  ): void {
    const header =
      new Header({
        username:
          this.username,

        onSearch:
          (value) => {
            this.search(
              value,
              content,
            );
          },
      });

    header.render(
      container,
    );
  }

  private createPlayer(): void {
    const playerContainer =
      document.createElement('div');

    playerContainer.className =
      'app-layout__player';

    this.root.append(
      playerContainer,
    );

    this.audioPlayer =
      new AudioPlayer({
        onNext: () => {
          this.playNext();
        },

        onPrevious: () => {
          this.playPrevious();
        },
      });

    this.audioPlayer.render(
      playerContainer,
    );
  }

  private async loadTracks(
    content: HTMLElement,
  ): Promise<void> {
    this.showLoading(
      content,
    );

    try {
      const [
        tracks,
        favorites,
      ] =
        await Promise.all([
          this.trackService.getTracks(
            this.token,
          ),

          this.trackService.getFavorites(
            this.token,
          ),
        ]);

      this.tracks =
        tracks;

      this.filteredTracks =
        tracks;

      this.favoriteIds =
        new Set(
          favorites.map(
            (track) =>
              track.id,
          ),
        );

      this.renderTracks(
        content,
      );
    } catch (error) {
      this.showError(
        content,
        error,
      );
    }
  }

  private renderTracks(
    content: HTMLElement,
  ): void {
    content.innerHTML = '';

    const title =
      document.createElement('div');

    title.className =
      'tracks-header';

    title.innerHTML = `
      <div>
        <p class="tracks-header__subtitle">
          Вся музыка
        </p>

        <h1 class="tracks-header__title">
          Аудиокомпозиции
        </h1>
      </div>

      <span class="tracks-header__count">
        ${this.filteredTracks.length}
        ${
          this.getTrackWord(
            this.filteredTracks.length,
          )
        }
      </span>
    `;

    content.append(
      title,
    );

    const table =
      document.createElement('section');

    table.className =
      'tracks-table';

    const head =
      document.createElement('div');

    head.className =
      'tracks-table__head';

    head.innerHTML = `
      <span>№</span>
      <span>Название</span>
      <span>Альбом</span>
      <span>Дата</span>
      <span>♡</span>
      <span></span>
    `;

    const body =
      document.createElement('div');

    body.className =
      'tracks-table__body';

    if (
      this.filteredTracks.length ===
      0
    ) {
      body.innerHTML = `
        <div class="tracks-empty">
          <div class="tracks-empty__icon">
            ♪
          </div>

          <h2>
            Ничего не найдено
          </h2>

          <p>
            Попробуйте изменить поисковый запрос.
          </p>
        </div>
      `;
    } else {
      this.filteredTracks.forEach(
        (
          track,
          index,
        ) => {
          const card =
            new TrackCard(
              track,
              {
                index:
                  index + 1,

                isFavorite:
                  this.favoriteIds.has(
                    track.id,
                  ),

                isPlaying:
                  this.currentTrackId ===
                  track.id,

                onPlay:
                  (selectedTrack) => {
                    this.playTrack(
                      selectedTrack,
                    );
                  },

                onFavorite:
                  (selectedTrack) => {
                    void this.toggleFavorite(
                      selectedTrack,
                      content,
                    );
                  },

                onMenu:
                  (selectedTrack) => {
                    this.openMenu(
                      selectedTrack,
                    );
                  },
              },
            );

          body.append(
            card.render(),
          );
        },
      );
    }

    table.append(
      head,
      body,
    );

    content.append(
      table,
    );
  }

  private search(
    value: string,
    content: HTMLElement,
  ): void {
    const query =
      value
        .trim()
        .toLowerCase();

    if (!query) {
      this.filteredTracks =
        this.tracks;
    } else {
      this.filteredTracks =
        this.tracks.filter(
          (track) =>
            track.title
              .toLowerCase()
              .includes(query) ||
            track.artist
              .toLowerCase()
              .includes(query) ||
            (
              track.album ?? ''
            )
              .toLowerCase()
              .includes(query),
        );
    }

    this.renderTracks(
      content,
    );
  }

  private playTrack(
    track: Track,
  ): void {
    this.currentTrackId =
      track.id;

    this.audioPlayer?.setTrack(
      track,
    );

    this.audioPlayer?.play();

    const content =
      this.root.querySelector<HTMLElement>(
        '.app-layout__content',
      );

    if (content) {
      this.renderTracks(
        content,
      );
    }
  }

  private playNext(): void {
    if (
      this.tracks.length === 0
    ) {
      return;
    }

    const index =
      this.tracks.findIndex(
        (track) =>
          track.id ===
          this.currentTrackId,
      );

    const nextIndex =
      index === -1 ||
      index >=
        this.tracks.length - 1
        ? 0
        : index + 1;

    this.playTrack(
      this.tracks[nextIndex],
    );
  }

  private playPrevious(): void {
    if (
      this.tracks.length === 0
    ) {
      return;
    }

    const index =
      this.tracks.findIndex(
        (track) =>
          track.id ===
          this.currentTrackId,
      );

    const previousIndex =
      index <= 0
        ? this.tracks.length - 1
        : index - 1;

    this.playTrack(
      this.tracks[previousIndex],
    );
  }

  private async toggleFavorite(
    track: Track,
    content: HTMLElement,
  ): Promise<void> {
    const isFavorite =
      this.favoriteIds.has(
        track.id,
      );

    try {
      if (isFavorite) {
        await this.trackService.removeFavorite(
          track.id,
          this.token,
        );

        this.favoriteIds.delete(
          track.id,
        );
      } else {
        await this.trackService.addFavorite(
          track.id,
          this.token,
        );

        this.favoriteIds.add(
          track.id,
        );
      }

      this.renderTracks(
        content,
      );
    } catch (error) {
      console.error(
        'Ошибка избранного:',
        error,
      );
    }
  }

  private openMenu(
    track: Track,
  ): void {
    console.log(
      'Открыть меню трека:',
      track,
    );
  }

  private showLoading(
    content: HTMLElement,
  ): void {
    content.innerHTML = `
      <div class="state state--loading">
        <div class="loader"></div>

        <p>
          Загружаем композиции...
        </p>
      </div>
    `;
  }

  private showError(
    content: HTMLElement,
    error: unknown,
  ): void {
    const message =
      error instanceof Error
        ? error.message
        : 'Неизвестная ошибка';

    content.innerHTML = `
      <div class="state state--error">
        <div class="state__icon">
          !
        </div>

        <h2>
          Не удалось загрузить композиции
        </h2>

        <p>
          ${this.escapeHtml(
            message,
          )}
        </p>

        <button
          class="button button--primary"
          type="button"
          data-retry
        >
          Повторить
        </button>
      </div>
    `;

    const retry =
      content.querySelector<HTMLButtonElement>(
        '[data-retry]',
      );

    retry?.addEventListener(
      'click',
      () => {
        void this.loadTracks(
          content,
        );
      },
    );
  }

  private getTrackWord(
    count: number,
  ): string {
    const lastTwo =
      count % 100;

    const last =
      count % 10;

    if (
      lastTwo >= 11 &&
      lastTwo <= 14
    ) {
      return 'треков';
    }

    if (last === 1) {
      return 'трек';
    }

    if (
      last >= 2 &&
      last <= 4
    ) {
      return 'трека';
    }

    return 'треков';
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
}