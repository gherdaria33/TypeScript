import { el } from 'redom';

type Route = 'tracks' | 'favorites' | 'profile';

export class Sidebar {
  public readonly el: HTMLElement;

  constructor(
    active: Route,
    onTracks: () => void,
    onFavorites: () => void,
    onProfile: () => void
  ) {
    const close = (): void => this.el.classList.remove('sidebar--open');
    const button = (route: Route, icon: string, text: string, action: () => void) =>
      el(`button.sidebar__item${active === route ? '.sidebar__item--active' : ''}`, {
        type: 'button',
        onclick: () => { action(); close(); },
        'data-route': route
      }, [el('span.sidebar__icon', icon), el('span.sidebar__text', text)]);

    const overlay = el('button.sidebar__overlay', {
      type: 'button',
      'aria-label': 'Закрыть меню',
      onclick: close
    });

    this.el = el('aside.sidebar', [
      el('div.sidebar__brand', [
        el('span.sidebar__brand-mark', '➜'),
        el('span.sidebar__brand-text', 'VibeCast Studio')
      ]),
      el('nav.sidebar__nav', [
        button('favorites', '♫', 'Избранное', onFavorites),
        button('tracks', '♫', 'Аудиокомпозиции', onTracks)
      ]),
      el('button.sidebar__profile-link', {
        type: 'button',
        onclick: () => { onProfile(); close(); }
      }, [el('span.sidebar__profile-icon', '●'), el('span', 'Профиль')]),
      overlay
    ]) as HTMLElement;

    window.addEventListener('toggle-sidebar', () => {
      this.el.classList.toggle('sidebar--open');
    });
  }
}
