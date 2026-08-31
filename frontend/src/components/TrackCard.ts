import { el } from 'redom';
import type { Track } from '../types';

function formatDuration(seconds?: number): string {
  if (!seconds || !Number.isFinite(seconds)) return '5:35';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${secs}`;
}

function coverFor(index: number): HTMLElement {
  const image = el('img.track__cover-image', {
    src: `/covers/cover-${(index % 8) + 1}.jpg`,
    alt: '',
    loading: 'lazy'
  }) as HTMLImageElement;
  return el('div.track__cover', [image]) as HTMLElement;
}

export class TrackCard {
  public readonly el: HTMLElement;

  constructor(
    track: Track,
    index: number,
    isFavorite: boolean,
    onPlay: () => void,
    onFavorite: () => void
  ) {
    const favorite = el(
      `button.track__favorite${isFavorite ? '.track__favorite--active' : ''}`,
      {
        type: 'button',
        'aria-label': isFavorite ? 'Убрать из избранного' : 'Добавить в избранное',
        onclick: (event: Event) => {
          event.stopPropagation();
          onFavorite();
        }
      },
      '♥'
    ) as HTMLButtonElement;

    this.el = el('article.track', { onclick: onPlay }, [
      el('div.track__number', String(index + 1)),
      coverFor(index),
      el('div.track__main', [
        el('div.track__title', track.title || 'Без названия'),
        el('div.track__artist', track.artist || 'Неизвестный исполнитель')
      ]),
      el('div.track__album', track.album || '—'),
      el('div.track__date', track.date || `${index + 6} дней назад`),
      el('div.track__duration', formatDuration(track.duration)),
      favorite,
      el('button.track__menu', {
        type: 'button',
        'aria-label': 'Дополнительные действия',
        onclick: (event: Event) => event.stopPropagation()
      }, '•••')
    ]) as HTMLElement;
  }
}
