import { el } from 'redom';

import { favoriteService } from '../services/favoriteService';
import { playerService } from '../services/playerService';
import { trackService } from '../services/trackService';

import type { Track } from '../types';
import { TrackCard } from '../components/TrackCard';

export class MainPage {
  public readonly el: HTMLElement;

  // Все треки
  private tracks: Track[] = [];

  // ID избранных треков
  private favorites = new Set<number>();

  // Пагинация
  private page = 1;
  private readonly perPage = 8;

  // Элементы страницы
  private readonly list: HTMLElement;
  private readonly pagination: HTMLElement;
  private readonly status: HTMLElement;

  // Поиск
  private search = '';

  // Обработчик поиска
  private readonly onSearch = (event: Event): void => {
    const customEvent = event as CustomEvent<string>;

    this.search = (customEvent.detail ?? '')
      .trim()
      .toLowerCase();

    this.page = 1;

    this.renderList();
  };

  constructor() {
    // Создаём контейнеры
    this.list = el(
      'div.tracks-list'
    ) as HTMLElement;

    this.pagination = el(
      'div.pagination'
    ) as HTMLElement;

    this.status = el(
      'div.page__status'
    ) as HTMLElement;

    // Основная страница
    this.el = el(
      'main.page',
      [
        // Заголовок
        el(
          'div.page__heading',
          [
            el('img.page__title-image', {
              src: '/covers/text3.svg',
              alt: 'Аудиофайлы и треки',
            }),
          ]
        ),

        // Статус
      this.status,

        // Шапка списка
        el(
          'div.tracks-head',
          [
            el('span', '№'),

            el('span', ''),

            el(
              'span',
              'Название'
            ),

            el(
              'span',
              'Альбом'
            ),

            el(
              'img',
              {
                src: '/covers/Calendar.svg',
                alt: 'Дата добавления',
              }
            ),

            el(
              'img',
              {
                src: '/covers/Clock.svg',
                alt: 'Время',
              }
            ),

            el(
              'span',
              ''
            ),
          ]
        ),

        // Треки
      this.list,

        // Пагинация
        this.pagination,
      ]
    ) as HTMLElement;

    // Слушаем поиск
    window.addEventListener(
      'audio-search',
      this.onSearch
    );

    // Загружаем данные
    void this.load();
  }

  /**
   * Загрузка треков и избранного
   */
  private async load(): Promise<void> {
    try {
      this.status.textContent =
        'Загрузка...';

      // Загружаем все треки
      const tracks =
        await trackService.getTracks();

      this.tracks = tracks;

      // Загружаем избранное
      try {
        const favorites =
          await favoriteService.getFavorites();

        this.favorites = new Set(
          favorites.map(
            (track) => track.id
          )
        );
      } catch (error) {
        console.warn(
          'Не удалось загрузить избранное:',
          error
        );

        this.favorites =
          new Set<number>();
      }

      // Передаём треки плееру
      playerService.setTracks(
        tracks
      );

      this.status.textContent =
        `${tracks.length} аудиофайлов`;

      // Рисуем список
      this.renderList();

    } catch (error) {
      console.error(
        'Ошибка загрузки:',
        error
      );

      this.status.textContent =
        error instanceof Error
          ? error.message
          : 'Не удалось загрузить треки';
    }
  }

  /**
   * Отрисовка списка
   */
  private renderList(): void {
    this.list.replaceChildren();

    // Фильтрация поиска
    const filtered =
      this.search.length > 0
        ? this.tracks.filter(
            (track) => {
              const searchText = [
                track.title ?? '',
                track.artist ?? '',
                track.album ?? '',
              ]
                .join(' ')
                .toLowerCase();

              return searchText.includes(
                this.search
              );
            }
          )
      : this.tracks;

    // Количество страниц
    const totalPages =
      Math.max(
        1,
        Math.ceil(
          filtered.length /
            this.perPage
        )
      );

    // Если текущая страница стала больше
    // после поиска
    this.page = Math.min(
      this.page,
      totalPages
    );

    // Начало текущей страницы
    const start =
      (this.page - 1) *
      this.perPage;

    // Треки текущей страницы
    const currentTracks =
      filtered.slice(
        start,
        start + this.perPage
      );

    // Если ничего нет
    if (
      currentTracks.length === 0
    ) {
      this.list.append(
        el(
          'div.tracks-empty',
          this.search
            ? 'По вашему запросу ничего не найдено'
            : 'Треков пока нет'
        )
      );

      this.pagination.replaceChildren();

      return;
    }

    // Создаём карточки
    currentTracks.forEach(
      (track, offset) => {
        const card =
          new TrackCard(
        track,

            // Номер трека
        start + offset,

            // Избранный или нет
            this.favorites.has(
              track.id
            ),

            // Play
            () => {
              void this.play(
                track
              );
            },

            // Favorite
            () => {
              void this.toggleFavorite(
                track
              );
            }
          );

        this.list.append(
          card.el
        );
      }
    );

    // Пагинация
    this.renderPagination(
      totalPages
    );
  }

  /**
   * Воспроизведение трека
   */
  private async play(
    track: Track
  ): Promise<void> {
    try {
      await playerService.toggle(
        track
      );
    } catch (error) {
      console.error(
        'Ошибка воспроизведения:',
        error
      );

      this.status.textContent =
        error instanceof Error
          ? error.message
          : 'Не удалось воспроизвести аудио';
    }
  }

  /**
   * Добавить / удалить избранное
   */
  private async toggleFavorite(
    track: Track
  ): Promise<void> {
    const isFavorite =
      this.favorites.has(
        track.id
      );

    try {
      // Добавление
      if (!isFavorite) {
        this.status.textContent =
          'Добавляем в избранное...';

        await favoriteService.add(
          track.id
        );

        this.favorites.add(
          track.id
        );

        this.status.textContent =
          'Добавлено в избранное ♥';
      }

      // Удаление
      else {
        this.status.textContent =
          'Удаляем из избранного...';

        await favoriteService.remove(
          track.id
        );

        this.favorites.delete(
          track.id
        );

        this.status.textContent =
          'Удалено из избранного';
      }

      // Перерисовываем список
      this.renderList();

      // Возвращаем количество треков
      window.setTimeout(() => {
        this.status.textContent =
          `${this.tracks.length} аудиофайлов`;
      }, 1200);

    } catch (error) {
      console.error(
        'Ошибка избранного:',
        error
      );

      this.status.textContent =
        error instanceof Error
          ? error.message
          : 'Не удалось изменить избранное';
    }
  }

  /**
   * Пагинация
   */
  private renderPagination(
    totalPages: number
  ): void {
    this.pagination.replaceChildren();

    // Если всего одна страница
    if (totalPages <= 1) {
      return;
    }

    // Создаём кнопки страниц
    for (
      let page = 1;
      page <= totalPages;
      page += 1
    ) {
      const button =
        el(
          `button.pagination__button${
            page === this.page
              ? '.pagination__button--active'
              : ''
          }`,
          {
            type: 'button',

            onclick: () => {
              this.page = page;

              this.renderList();

              // Прокручиваем к началу списка
              this.list.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              });
            },
          },

          String(page)
        );

      this.pagination.append(
        button
      );
    }
  }

  /**
   * Очистка страницы
   */
  public destroy(): void {
    window.removeEventListener(
      'audio-search',
      this.onSearch
    );

    this.list.replaceChildren();
    this.pagination.replaceChildren();
  }
}
