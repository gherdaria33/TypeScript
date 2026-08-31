import { el } from 'redom';
import { playerService } from '../services/playerService';
import type { Track } from '../types';

function time(value: number): string {
  if (!Number.isFinite(value)) return '0:00';
  const m = Math.floor(value / 60);
  const s = Math.floor(value % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export class Player {
  public readonly el: HTMLElement;
  private title: HTMLElement;
  private artist: HTMLElement;
  private playButton: HTMLButtonElement;
  private currentTime: HTMLElement;
  private duration: HTMLElement;
  private range: HTMLInputElement;
  private cover: HTMLElement;

  constructor() {
    this.title = el('div.player__title', 'Выберите композицию');
    this.cover = el('div.player__cover', '♫');
    this.artist = el('div.player__artist', '—');
    this.playButton = el('button.player__button.player__button--play', {
      type: 'button',
      onclick: () => { void playerService.toggle().catch((error: unknown) => console.error(error)); }
    }, '▶') as HTMLButtonElement;

    const prev = el('button.player__button', {
      type: 'button',
      title: 'Предыдущий трек',
      onclick: () => playerService.previous()
    }, '◀◀');

    const next = el('button.player__button', {
      type: 'button',
      title: 'Следующий трек',
      onclick: () => playerService.next()
    }, '▶▶');

    const back = el('button.player__button', {
      type: 'button',
      title: '-10 секунд',
      onclick: () => playerService.seek(-10)
    }, '−10');

    const forward = el('button.player__button', {
      type: 'button',
      title: '+10 секунд',
      onclick: () => playerService.seek(10)
    }, '+10');

    this.currentTime = el('span.player__time', '0:00');
    this.duration = el('span.player__time', '0:00');
    this.range = el('input.player__range', {
      type: 'range',
      min: '0',
      max: '100',
      value: '0',
      step: '0.1',
      oninput: () => playerService.seekTo(Number(this.range.value) / 100)
    }) as HTMLInputElement;

    const audio = playerService.getAudio();
    audio.addEventListener('timeupdate', () => {
      this.currentTime.textContent = time(audio.currentTime);
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        this.duration.textContent = time(audio.duration);
        this.range.value = String((audio.currentTime / audio.duration) * 100);
      }
    });
    audio.addEventListener('loadedmetadata', () => {
      this.duration.textContent = time(audio.duration);
    });

    playerService.subscribe((track: Track | null, playing: boolean) => {
      if (track) {
        this.title.textContent = track.title || 'Без названия';
        this.artist.textContent = track.artist || 'Неизвестный исполнитель';
        const image = el('img.player__cover-image', { src: `/covers/cover-${Math.min(8, Math.max(1, track.id))}.jpg`, alt: '' }) as HTMLImageElement;
        this.cover.replaceChildren(image);
      }
      this.playButton.textContent = playing ? 'Ⅱ' : '▶';
    });

    this.el = el('footer.player', [
      el('div.player__info', [
        this.cover,
        el('div', [this.title, this.artist])
      ]),
      el('div.player__controls', [
        el('div.player__buttons', [prev, back, this.playButton, forward, next]),
        el('div.player__timeline', [
          this.currentTime,
          this.range,
          this.duration
        ])
      ])
    ]) as HTMLElement;

    window.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      if (event.code === 'ArrowLeft') playerService.seek(-10);
      if (event.code === 'ArrowRight') playerService.seek(10);
      if (event.code === 'Space') {
        event.preventDefault();
        playerService.toggle();
      }
    });
  }
}