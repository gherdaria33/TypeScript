import { el } from 'redom';
import { authService } from '../services/authService';

export class Header {
  public readonly el: HTMLElement;

  constructor(onProfile: () => void) {
    const user = authService.getUser();
    const initial = (user?.username?.[0] ?? 'U').toUpperCase();

    const hamburger = el('button.mobile-topbar__menu', {
      type: 'button',
      'aria-label': 'Открыть меню',
      onclick: () => window.dispatchEvent(new Event('toggle-sidebar'))
    }, [el('span', ''), el('span', ''), el('span', '')]);

    const searchInput = el('input.header__search-input', {
      type: 'search',
      placeholder: 'Что будем искать?',
      'aria-label': 'Поиск аудиофайлов',
      oninput: (event: Event) => {
        const target = event.currentTarget as HTMLInputElement;
        window.dispatchEvent(new CustomEvent<string>('audio-search', { detail: target.value }));
      }
    }) as HTMLInputElement;

    const profile = el('button.header__profile', {
      type: 'button',
      'aria-label': 'Открыть профиль',
      onclick: onProfile
    }, [
      el('span.header__avatar', initial),
      el('span.header__username', user?.username ?? 'username'),
      el('span.header__chevron', '›')
    ]) as HTMLButtonElement;

    const mobileProfile = el('button.mobile-app-head__profile', {
      type: 'button',
      'aria-label': 'Открыть профиль',
      onclick: onProfile
    }, [
      el('span.header__avatar', initial),
      el('span.header__username', user?.username ?? 'username')
    ]);

    const mobileHead = el('div.mobile-app-head', [
      el('div.mobile-app-head__brand', [
        el('span.mobile-app-head__mark', '➜'),
        el('strong', 'VibeCast Studio')
      ]),
      mobileProfile
    ]);

    this.el = el('header.header', [
      el('div.mobile-topbar', [hamburger, el('span.mobile-topbar__title', 'TypeScript')]),
      mobileHead,
      el('label.header__search', [
        el('span.header__search-icon', '⌕'),
        searchInput
      ]),
      el('div.header__actions', [profile])
    ]) as HTMLElement;
  }
}
