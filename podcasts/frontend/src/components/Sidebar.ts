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
    const button = (
      route: Route,
      icon: string,
      text: string,
      action: () => void
    ) => el(`button.sidebar__item${active === route ? '.sidebar__item--active' : ''}`, {
      type: 'button',
      onclick: action,
      'data-route': route
    }, [
      el('span.sidebar__icon', icon),
      el('span.sidebar__text', text)
    ]);

    this.el = el('aside.sidebar', [
      el('div.sidebar__brand', [
        el('span.sidebar__brand-mark', '◒'),
        el('span.sidebar__brand-text', 'webcast studio')
      ]),
      el('nav.sidebar__nav', [
        button('tracks', '♫', 'Аудиокомпозиции', onTracks),
        button('favorites', '♡', 'Избранное', onFavorites)
      ]),
      el('button.sidebar__profile-link', {
        type: 'button',
        onclick: onProfile
      }, [
        el('span.sidebar__profile-icon', '●'),
        el('span', 'Профиль')
      ])
    ]) as HTMLElement;
  }
}
