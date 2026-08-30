import { el } from 'redom';
import type { Track } from '../types';

function formatDuration(seconds?: number): string {
  if (!seconds || !Number.isFinite(seconds)) return '—';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${secs}`;
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
      isFavorite ? '♥' : '♡'
    );

    const menu = el('button.track__menu', {
      type: 'button',
      'aria-label': 'Дополнительные действия',
      onclick: (event: Event) => event.stopPropagation()
    }, '•••');

    this.el = el('article.track', { onclick: onPlay }, [
      el('div.track__number', String(index + 1).padStart(2, '0')),
      el('button.track__play', {
        type: 'button',
        'aria-label': `Воспроизвести ${track.title || 'трек'}`,
        onclick: (event: Event) => {
          event.stopPropagation();
          onPlay();
        }
      }, '▶'),
      el('div.track__main', [
        el('div.track__title', track.title || 'Без названия'),
        el('div.track__artist', track.artist || 'Неизвестный исполнитель')
      ]),
      el('div.track__album', track.album || '—'),
      el('div.track__date', track.date || '—'),
      el('div.track__duration', formatDuration(track.duration)),
      favorite,
      menu
    ]) as HTMLElement;
  }
}
