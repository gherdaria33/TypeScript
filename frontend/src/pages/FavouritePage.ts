import { el } from 'redom';
import { favoriteService } from '../services/favoriteService';
import { playerService } from '../services/playerService';
import type { Track } from '../types';
import { TrackCard } from '../components/TrackCard';

export class FavouritePage {
  public readonly el: HTMLElement;
  private list: HTMLElement;
  private status: HTMLElement;
  private tracks: Track[] = [];

  constructor(onTracks: () => void = () => window.history.pushState({}, '', '/')) {
    this.list = el('div.tracks-list') as HTMLElement;
    this.status = el('div.page__status') as HTMLElement;

    this.el = el('main.page', [
      el('div.page__heading', [
        el('div', [
          el('div.page__eyebrow', 'Ваша коллекция'),
          el('h1.page__title', 'Избранное'),
          el('nav.mobile-tabs', [
            el('button.mobile-tabs__item', { type: 'button', onclick: onTracks }, [el('span', '▷'), 'Аудиокомпозиции']),
            el('button.mobile-tabs__item.mobile-tabs__item--active', { type: 'button' }, 'Избранное')
          ]),
          el('p.page__subtitle', 'Треки, которые вы сохранили для быстрого доступа.')
        ])
      ]),
      this.status,
      this.list
    ]) as HTMLElement;

    void this.load();
  }

  private async load(): Promise<void> {
    try {
      this.status.textContent = 'Загрузка…';
      this.tracks = await favoriteService.getFavorites();
      playerService.setTracks(this.tracks);
      this.status.textContent = this.tracks.length
        ? `${this.tracks.length} избранных композиций`
        : 'Пока нет избранных композиций';
      this.render();
    } catch (error) {
      this.status.textContent = error instanceof Error ? error.message : 'Не удалось загрузить избранное';
    }
  }

  private render(): void {
    this.list.replaceChildren();
    this.tracks.forEach((track, index) => {
      const card = new TrackCard(
        track,
        index,
        true,
        () => playerService.toggle(track),
        () => void this.remove(track)
      );
      this.list.append(card.el);
    });
  }

  private async remove(track: Track): Promise<void> {
    try {
      await favoriteService.remove(track.id);
      this.tracks = this.tracks.filter(item => item.id !== track.id);
      this.render();
      this.status.textContent = this.tracks.length
        ? `${this.tracks.length} избранных композиций`
        : 'Пока нет избранных композиций';
    } catch (error) {
      this.status.textContent = error instanceof Error ? error.message : 'Ошибка удаления';
    }
  }
}