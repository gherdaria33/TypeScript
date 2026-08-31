import { el } from 'redom';
import logo from '../public/covers/Mithosis.png';
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
    ) =>
      el(
        `button.sidebar__item${
          active === route ? '.sidebar__item--active' : ''
        }`,
        {
          type: 'button',
          onclick: action,
          'data-route': route,
        },
        [
          el('span.sidebar__icon', icon),
          el('span.sidebar__text', text),
        ]
      );
    // Логотип
    const logoImage = el('img.sidebar__logo', {
      src: logo,
      alt: 'VibeCast Studio',
    });
    this.el = el(
      'aside.sidebar',
      [
        // Логотип
        el('div.sidebar__brand', [
          logoImage,
          el('span.sidebar__brand-text', 'VibeCast Studio'),
        ]),
        // Навигация
        el('nav.sidebar__nav', [
          button(
            'tracks',
            '♫',
            'Аудиокомпозиции',
            onTracks
          ),
          button(
            'favorites',
            '♡',
            'Избранное',
            onFavorites
          ),
        ]),
        // Профиль
        el(
          'button.sidebar__profile-link',
          {
            type: 'button',
            onclick: onProfile,
          },
          [
            el('span.sidebar__profile-icon', '●'),
            el('span', 'Профиль'),
          ]
        ),
      ]
    ) as HTMLElement;
  }
}