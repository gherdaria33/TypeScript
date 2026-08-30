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
  private readonly perPage = 10;
  private list: HTMLElement;
  private pagination: HTMLElement;
  private status: HTMLElement;
  private search = '';

  constructor() {
    this.list = el('div.tracks-list') as HTMLElement;
    this.pagination = el('div.pagination') as HTMLElement;
    this.status = el('div.page__status') as HTMLElement;

    const searchInput = el('input.page__search', {
      type: 'search',
      placeholder: 'Поиск по названию или исполнителю…',
      oninput: (event: Event) => {
        const target = event.currentTarget as HTMLInputElement;
        this.search = target.value.trim().toLowerCase();
        this.page = 1;
        this.renderList();
      }
    }) as HTMLInputElement;

    this.el = el('main.page', [
      el('div.page__heading', [
        el('div', [
          el('div.page__eyebrow', 'Медиатека'),
          el('h1.page__title', 'Все композиции'),
          el('p.page__subtitle', 'Слушайте музыку, сохраняйте любимые треки и управляйте воспроизведением.')
        ]),
        searchInput
      ]),
      this.status,
      el('div.tracks-head', [
        el('span', '#'),
        el('span', 'Композиция'),
        el('span', 'Альбом'),
        el('span', 'Дата'),
        el('span', 'Время'),
        el('span', '♡')
      ]),
      this.list,
      this.pagination
    ]) as HTMLElement;

    void this.load();
  }

  private async load(): Promise<void> {
    try {
      this.status.textContent = 'Загрузка…';
      const [tracks, favorites] = await Promise.all([
        trackService.getTracks(),
        favoriteService.getFavorites()
      ]);
      this.tracks = tracks;
      this.favorites = new Set<number>(favorites.map(track => track.id));
      playerService.setTracks(tracks);
      this.status.textContent = `${tracks.length} композиций`;
      this.renderList();
    } catch (error) {
      this.status.textContent = error instanceof Error ? error.message : 'Не удалось загрузить треки';
    }
  }

  private getFiltered(): Track[] {
    if (!this.search) return this.tracks;
    return this.tracks.filter(track =>
      `${track.title} ${track.artist}`.toLowerCase().includes(this.search)
    );
  }

  private renderList(): void {
    this.list.replaceChildren();
    const filtered = this.getFiltered();
    const totalPages = Math.max(1, Math.ceil(filtered.length / this.perPage));
    this.page = Math.min(this.page, totalPages);

    const start = (this.page - 1) * this.perPage;
    filtered.slice(start, start + this.perPage).forEach((track, offset) => {
      const card = new TrackCard(
        track,
        start + offset,
        this.favorites.has(track.id),
        () => playerService.toggle(track),
        () => void this.toggleFavorite(track)
      );
      this.list.append(card.el);
    });

    this.renderPagination(totalPages);
  }

  private renderPagination(total: number): void {
    this.pagination.replaceChildren();
    if (total <= 1) return;

    for (let page = 1; page <= total; page += 1) {
      const button = el(
        `button.pagination__button${page === this.page ? '.pagination__button--active' : ''}`,
        { type: 'button', onclick: () => { this.page = page; this.renderList(); } },
        String(page)
      );
      this.pagination.append(button);
    }
  }

  private async toggleFavorite(track: Track): Promise<void> {
    const wasFavorite = this.favorites.has(track.id);
    try {
      if (wasFavorite) {
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