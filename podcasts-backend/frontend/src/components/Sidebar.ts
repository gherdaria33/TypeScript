import { el } from 'redom';

export class Sidebar {
  public readonly el: HTMLElement;

  constructor(
    active: 'tracks' | 'favorites' | 'profile',
    onTracks: () => void,
    onFavorites: () => void,
    onProfile: () => void
  ) {
    const button = (key: string, icon: string, text: string, action: () => void) =>
      el(`button.sidebar__item${active === key ? '.sidebar__item--active' : ''}`, {
        type: 'button',
        onclick: action
      }, [el('span.sidebar__icon', icon), el('span', text)]);

    this.el = el('aside.sidebar', [
      el('div.sidebar__nav', [
        button('tracks', '▣', 'Все композиции', onTracks),
        button('favorites', '♡', 'Избранное', onFavorites),
        button('profile', '◉', 'Профиль', onProfile)
      ])
    ]) as HTMLElement;
  }
}