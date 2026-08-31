import { el } from 'redom';
import type { Track } from '../types';
function formatDuration(seconds?: number): string {
  if (
    seconds === undefined ||
    seconds === null ||
    !Number.isFinite(Number(seconds))
  ) {
    return '5:15';
  }
  const totalSeconds = Number(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${secs}`;
}
function coverFor(
  index: number,
  track: Track
): HTMLElement {
  const coverNumber = (index % 6) + 1;
  return el(
    'div.track__cover',
    [
      el('img', {
        src: `/covers/track${coverNumber}.svg`,
        alt: track.album || track.title || 'Обложка альбома',
      }),
    ]
  ) as HTMLElement;
}
export class TrackCard {
  public readonly el: HTMLElement;
  private readonly favoriteButton: HTMLButtonElement;
  constructor(
    track: Track,
    index: number,
    isFavorite: boolean,
    onPlay: () => void,
    onFavorite: () => void
  ) {
    this.favoriteButton = el(
      `button.track__favorite${
        isFavorite
          ? '.track__favorite--active'
          : ''
      }`,
      {
        type: 'button',
        'aria-label': isFavorite
          ? 'Убрать из избранного'
          : 'Добавить в избранное',
        onclick: (event: Event) => {
          event.preventDefault();
          event.stopPropagation();
          onFavorite();
        },
      },
      isFavorite ? '♥' : '♡'
    ) as HTMLButtonElement;
    this.el = el(
      'article.track',
      {
        onclick: () => {
          onPlay();
        },
      },
      [
        // Номер
        el(
          'div.track__number',
          String(index + 1)
        ),
        // SVG обложка альбома
        coverFor(index, track),
        // Название + исполнитель
        el(
          'div.track__main',
          [
            el(
              'div.track__title',
              track.title || 'Без названия'
            ),
            el(
              'div.track__artist',
              track.artist ||
                'Неизвестный исполнитель'
            ),
          ]
        ),
        // Альбом
        el(
          'div.track__album',
          track.album ||
            track.title ||
            '—'
        ),
        // Дата
        el(
          'div.track__date',
          track.date ||
            `${index + 1} дней назад`
        ),
        // Избранное
        this.favoriteButton,
        // Время
        el(
          'div.track__duration',
          formatDuration(track.duration)
        ),
        // Меню
        el(
          'button.track__menu',
          {
        type: 'button',
            'aria-label':
              'Дополнительные действия',
            onclick: (event: Event) => {
              event.preventDefault();
              event.stopPropagation();
            },
          },
          '•••'
        ),
      ]
    ) as HTMLElement;
  }
  public setFavorite(
    isFavorite: boolean
  ): void {
    this.favoriteButton.textContent =
      isFavorite ? '♥' : '♡';
    this.favoriteButton.classList.toggle(
      'track__favorite--active',
      isFavorite
    );
    this.favoriteButton.setAttribute(
      'aria-label',
      isFavorite
        ? 'Убрать из избранного'
        : 'Добавить в избранное'
    );
  }
}