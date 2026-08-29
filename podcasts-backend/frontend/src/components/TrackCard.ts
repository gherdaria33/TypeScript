import type { Track } from '../types/track';

export interface TrackCardOptions {
  index?: number;
  isFavorite?: boolean;
  isPlaying?: boolean;

  onPlay?: (
    track: Track,
  ) => void;

  onFavorite?: (
    track: Track,
  ) => void;

  onMenu?: (
    track: Track,
  ) => void;
}

export class TrackCard {
  private readonly track: Track;
  private readonly options: TrackCardOptions;

  public constructor(
    track: Track,
    options: TrackCardOptions = {},
  ) {
    this.track = track;
    this.options = options;
  }

  public render(): HTMLElement {
    const row =
      document.createElement('div');

    row.className =
      'track-row';

    if (
      this.options.isPlaying
    ) {
      row.classList.add(
        'track-row--playing',
      );
    }

    row.dataset.trackId =
      this.track.id;

    const number =
      document.createElement('div');

    number.className =
      'track-row__number';

    number.textContent =
      String(
        this.options.index ?? '',
      );

    const info =
      document.createElement('div');

    info.className =
      'track-row__info';

    const cover =
      document.createElement('div');

    cover.className =
      'track-row__cover';

    cover.textContent = '♪';

    const text =
      document.createElement('div');

    text.className =
      'track-row__text';

    const title =
      document.createElement('div');

    title.className =
      'track-row__title';

    title.textContent =
      this.track.title;

    const artist =
      document.createElement('div');

    artist.className =
      'track-row__artist';

    artist.textContent =
      this.track.artist;

    text.append(
      title,
      artist,
    );

    info.append(
      cover,
      text,
    );

    const album =
      document.createElement('div');

    album.className =
      'track-row__album';

    album.textContent =
      this.track.album ||
      '—';

    const date =
      document.createElement('div');

    date.className =
      'track-row__date';

    date.textContent =
      this.getDate();

    const favorite =
      document.createElement('button');

    favorite.type =
      'button';

    favorite.className =
      'track-row__favorite';

    if (
      this.options.isFavorite
    ) {
      favorite.classList.add(
        'track-row__favorite--active',
      );
    }

    favorite.setAttribute(
      'aria-label',
      this.options.isFavorite
        ? 'Удалить из избранного'
        : 'Добавить в избранное',
    );

    favorite.innerHTML =
      this.options.isFavorite
        ? '♥'
        : '♡';

    const menu =
      document.createElement('button');

    menu.type =
      'button';

    menu.className =
      'track-row__menu';

    menu.setAttribute(
      'aria-label',
      'Меню трека',
    );

    menu.textContent =
      '⋮';

    row.append(
      number,
      info,
      album,
      date,
      favorite,
      menu,
    );

    row.addEventListener(
      'click',
      (event) => {
        const target =
          event.target;

        if (
          target instanceof
          HTMLButtonElement
        ) {
          return;
        }

        this.options.onPlay?.(
          this.track,
        );
      },
    );

    favorite.addEventListener(
      'click',
      (event) => {
        event.stopPropagation();

        this.options.onFavorite?.(
          this.track,
        );
      },
    );

    menu.addEventListener(
      'click',
      (event) => {
        event.stopPropagation();

        this.options.onMenu?.(
          this.track,
        );
      },
    );

    return row;
  }

  private getDate(): string {
    const possibleDate =
      (
        this.track as Track & {
          date?: string;
          createdAt?: string;
        }
      ).date ??
      (
        this.track as Track & {
          date?: string;
          createdAt?: string;
        }
      ).createdAt;

    if (!possibleDate) {
      return '—';
    }

    const parsed =
      new Date(
        possibleDate,
      );

    if (
      Number.isNaN(
        parsed.getTime(),
      )
    ) {
      return possibleDate;
    }

    return parsed.toLocaleDateString(
      'ru-RU',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      },
    );
  }
}