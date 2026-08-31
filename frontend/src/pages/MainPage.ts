import { el } from 'redom';
import { favoriteService } from '../services/favoriteService';
import { playerService } from '../services/playerService';
import { trackService } from '../services/trackService';
import type { Track } from '../types';
import { TrackCard } from '../components/TrackCard';

export class MainPage {
  public readonly el: HTMLElement;
  private tracks: Track[] = [];
  private favorites = new Set<number>();
  private page = 1;
  private readonly perPage = 8;
  private list: HTMLElement;
  private pagination: HTMLElement;
  private status: HTMLElement;
  private search = '';
  private readonly onSearch = (event: Event): void => {
    const custom = event as CustomEvent<string>;
    this.search = (custom.detail ?? '').trim().toLowerCase();
    this.page = 1;
    this.renderList();
  };

  constructor(onFavorites: () => void = () => window.history.pushState({}, '', '/favorites')) {
    this.list = el('div.tracks-list') as HTMLElement;
    this.pagination = el('div.pagination') as HTMLElement;
    this.status = el('div.page__status') as HTMLElement;

    this.el = el('main.page', [
      el('div.page__heading', [
        el('h1.page__title', 'Аудиофайлы и треки'),
        el('nav.mobile-tabs', [
          el('button.mobile-tabs__item.mobile-tabs__item--active', { type: 'button' }, [el('span', '▷'), 'Аудиокомпозиции']),
          el('button.mobile-tabs__item', { type: 'button', onclick: onFavorites }, 'Избранное')
        ])
      ]),
      this.status,
      el('div.tracks-head', [
        el('span', '#'), el('span', ''), el('span', 'Название'), el('span', 'Альбом'),
        el('span', 'Дата добавления'), el('span', 'Время'), el('span', '♡'), el('span', '')
      ]),
      this.list,
      this.pagination
    ]) as HTMLElement;

    window.addEventListener('audio-search', this.onSearch);
    void this.load();
  }

  private async load(): Promise<void> {
    try {
      this.status.textContent = 'Загрузка...';
      const [tracks, favorites] = await Promise.all([
        trackService.getTracks(),
        favoriteService.getFavorites()
      ]);
      this.tracks = tracks;
      this.favorites = new Set(favorites.map(track => track.id));
      playerService.setTracks(tracks);
      this.status.textContent = `${tracks.length} аудиофайлов`;
      this.renderList();
    } catch (error) {
      this.status.textContent = error instanceof Error ? error.message : 'Не удалось загрузить треки';
    }
  }

  private renderList(): void {
    this.list.replaceChildren();
    const filtered = this.search
      ? this.tracks.filter(track => `${track.title} ${track.artist} ${track.album ?? ''}`.toLowerCase().includes(this.search))
      : this.tracks;
    const totalPages = Math.max(1, Math.ceil(filtered.length / this.perPage));
    this.page = Math.min(this.page, totalPages);
    const start = (this.page - 1) * this.perPage;

    filtered.slice(start, start + this.perPage).forEach((track, offset) => {
      this.list.append(new TrackCard(
        track,
        start + offset,
        this.favorites.has(track.id),
        () => void this.play(track),
        () => void this.toggleFavorite(track)
      ).el);
    });
    this.renderPagination(totalPages);
  }

  private async play(track: Track): Promise<void> {
    try {
      await playerService.toggle(track);
    } catch (error) {
      this.status.textContent = error instanceof Error ? error.message : 'Не удалось воспроизвести аудио';
    }
  }

  private renderPagination(total: number): void {
    this.pagination.replaceChildren();
    if (total <= 1) return;
    for (let page = 1; page <= total; page += 1) {
      this.pagination.append(el(`button.pagination__button${page === this.page ? '.pagination__button--active' : ''}`, {
        type: 'button',
        onclick: () => { this.page = page; this.renderList(); }
      }, String(page)));
    }
  }

  private async toggleFavorite(track: Track): Promise<void> {
    try {
      if (this.favorites.has(track.id)) {
        await favoriteService.remove(track.id);
        this.favorites.delete(track.id);
      } else {
        await favoriteService.add(track.id);
        this.favorites.add(track.id);
      }
      this.renderList();
    } catch (error) {
      this.status.textContent = error instanceof Error ? error.message : 'Ошибка избранного';
    }
  }
}
