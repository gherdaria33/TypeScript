import { el, setChildren } from 'redom';

import type { Track } from '../../types/Track';
import {
  TrackCard,
  type TrackCardOptions
} from './TrackCard';

export interface TrackListOptions {
  tracks: Track[];
  favorites: Set<string>;
  onPlay: (track: Track) => void;
  onFavorite: (track: Track) => void;
}

export class TrackList {
  private readonly options: TrackListOptions;

  constructor(options: TrackListOptions) {
    this.options = options;
  }

  render(): HTMLElement {
    const container = el(
      'div.track-list'
    );

    if (this.options.tracks.length === 0) {
      setChildren(
        container,
        el(
          'div.track-list__empty',
          'Треки не найдены'
        )
      );

      return container;
    }

    this.options.tracks.forEach(
      (track: Track, index: number) => {
        const cardOptions: TrackCardOptions = {
          track,
          index: index + 1,
          isFavorite:
            this.options.favorites.has(track.id),
          onPlay: this.options.onPlay,
          onFavorite: this.options.onFavorite
        };

        const card = new TrackCard(
          cardOptions
        );

        container.appendChild(
          card.render()
        );
      }
    );

    return container;
  }
}