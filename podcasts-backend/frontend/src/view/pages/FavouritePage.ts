import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import { TrackCard } from '../../components/TrackCard';
import { AudioPlayer } from '../../components/AudioPlayer';

import { TrackService } from '../../services/trackService';
import { LocalStorageClass } from '../../services/localStorageClass';

import type { Track } from '../../types/track';
import type { Router } from '../../router/Router';

export class FavouritePage {
  private readonly root: HTMLElement;
  private readonly router: Router;
  private readonly token: string;
  private readonly username: string;

  private readonly trackService: TrackService;
  private readonly storage: LocalStorageClass;

  private tracks: Track[] = [];
  private filteredTracks: Track[] = [];

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

    this.storage =
      new LocalStorageClass();
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

    await this.loadFavorites(
      content,
    );
  }

  private createSidebar(
    container: HTMLElement,
  ): void {
    const sidebar =
      new Sidebar({
        currentRoute:
          '/favorites',

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
    const container =
      document.createElement('div');

    container.className =
      'app-layout__player';

    this.root.append(
      container,
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
      container,
    );
  }

  private async loadFavorites(
    content: HTMLElement,
  ): Promise<void> {
    this.showLoading(
      content,
    );

    try {
      this.tracks =
        await this.trackService.getFavorites(
          this.token,
        );

      this.filteredTracks =
        this.tracks;

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

    const header =
      document.createElement('div');

    header.className =
      'tracks-header';

    header.innerHTML = `
      <div>
        <p class="tracks-header__subtitle">
          Ваша музыкальная коллекция
        </p>

        <h1 class="tracks-header__title">
          Избранное
        </h1>
      </div>

      <span class="tracks-header__count">
        ${
          this.filteredTracks.length
        } ${
          this.getTrackWord(
            this.filteredTracks.length,
          )
        }
      </span>
    `;

    content.append(
      header,
    );

    const table =
      document.createElement('section');

    table.className =
      'tracks-table';

    const tableHead =
      document.createElement('div');

    tableHead.className =
      'tracks-table__head';

    tableHead.innerHTML = `
      <span>№</span>
      <span>Название</span>
      <span>Альбом</span>
      <span>Дата</span>
      <span></span>
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
            ♡
          </div>

          <h2>
            В избранном пока пусто
          </h2>

          <p>
            Добавляйте понравившиеся композиции
            с помощью сердечка.
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
                  true,

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
                    void this.removeFavorite(
                      selectedTrack,
                      content,
                    );
                  },

                onMenu:
                  (selectedTrack) => {
                    console.log(
                      'Меню:',
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
      tableHead,
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
      value.trim().toLowerCase();

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
              .includes(query),
        );
    }

    this.renderTracks(
      content,
    );
  }

  private async removeFavorite(
    track: Track,
    content: HTMLElement,
  ): Promise<void> {
    try {
      await this.trackService.removeFavorite(
        track.id,
        this.token,
      );

      this.tracks =
        this.tracks.filter(
          (item) =>
            item.id !== track.id,
        );

      this.filteredTracks =
        this.filteredTracks.filter(
          (item) =>
            item.id !== track.id,
        );

      this.renderTracks(
        content,
      );
    } catch (error) {
      console.error(
        'Ошибка удаления из избранного:',
        error,
      );
    }
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

    const next =
      index === -1 ||
      index ===
        this.tracks.length - 1
        ? 0
        : index + 1;

    this.playTrack(
      this.tracks[next],
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

    const previous =
      index <= 0
        ? this.tracks.length - 1
        : index - 1;

    this.playTrack(
      this.tracks[previous],
    );
  }

  private showLoading(
    content: HTMLElement,
  ): void {
    content.innerHTML = `
      <div class="state state--loading">
        <div class="loader"></div>

        <p>
          Загрузка избранного...
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
          Не удалось загрузить избранное
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
        void this.loadFavorites(
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
