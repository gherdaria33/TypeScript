import { el, setChildren } from 'redom';

import type { Track } from '../../types/Track';

export interface TrackCardOptions {
  track: Track;
  index: number;
  isFavorite: boolean;
  onPlay: (track: Track) => void;
  onFavorite: (track: Track) => void;
}

export class TrackCard {
  private readonly track: Track;
  private readonly index: number;

  private readonly favoriteButton: HTMLButtonElement;

  private isFavorite: boolean;

  private readonly onPlay: (
    track: Track
  ) => void;

  private readonly onFavorite: (
    track: Track
  ) => void;

  constructor(options: TrackCardOptions) {
    this.track = options.track;
    this.index = options.index;
    this.isFavorite = options.isFavorite;
    this.onPlay = options.onPlay;
    this.onFavorite = options.onFavorite;

    this.favoriteButton = el(
      'button.track-card__favorite'
    ) as HTMLButtonElement;

    this.favoriteButton.type = 'button';

    this.favoriteButton.addEventListener(
      'click',
      () => {
        this.onFavorite(this.track);
      }
    );
  }

  render(): HTMLElement {
    const row = el('article.track-card');

    const number = el(
      'div.track-card__number',
      String(this.index)
    );

    const cover = this.createCover();

    const information = el(
      'div.track-card__information'
    );

    const title = el(
      'h3.track-card__title',
      this.track.title
    );

    const artist = el(
      'p.track-card__artist',
      this.track.artist
    );

    setChildren(
      information,
      title,
      artist
    );

    const album = el(
      'div.track-card__album',
      this.track.album ?? '—'
    );

    const playButton = el(
      'button.track-card__play',
      '▶'
    ) as HTMLButtonElement;

    playButton.type = 'button';

    playButton.addEventListener(
      'click',
      () => {
        this.onPlay(this.track);
      }
    );

    this.updateFavoriteButton();

    setChildren(
      row,
      number,
      cover,
      information,
      album,
      this.favoriteButton,
      playButton
    );

    return row;
  }

  setFavorite(value: boolean): void {
    this.isFavorite = value;
    this.updateFavoriteButton();
  }

  private updateFavoriteButton(): void {
    this.favoriteButton.textContent =
      this.isFavorite ? '♥' : '♡';

    this.favoriteButton.classList.toggle(
      'track-card__favorite--active',
      this.isFavorite
    );
  }

  private createCover(): HTMLElement {
    const cover = el(
      'div.track-card__cover'
    );

    const imageUrl =
      this.track.cover ??
      this.track.image;

    if (imageUrl) {
      const image = el(
        'img.track-card__image'
      ) as HTMLImageElement;

      image.src = imageUrl;
      image.alt = this.track.title;
      image.loading = 'lazy';

      setChildren(
        cover,
        image
      );
    } else {
      setChildren(
        cover,
        el(
          'span.track-card__placeholder',
          '♫'
        )
      );
    }

    return cover;
  }
}