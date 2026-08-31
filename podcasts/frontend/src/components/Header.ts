import { el } from 'redom';
import { authService } from '../services/authService';

export class Header {
  public readonly el: HTMLElement;

  constructor(onProfile: () => void) {
    const user = authService.getUser();
    const initial = (user?.username?.[0] ?? 'U').toUpperCase();

    const searchInput = el('input.header__search-input', {
      type: 'search',
      placeholder: 'ЧТО БУДЕМ ИСКАТЬ?',
      'aria-label': 'ЧТО БУДЕМ ИСКАТЬ',
      oninput: (event: Event) => {
        const target = event.currentTarget as HTMLInputElement;
        window.dispatchEvent(new CustomEvent<string>('audio-search', { detail: target.value }));
      }
    }) as HTMLInputElement;

    const search = el('label.header__search', [
      el('span.header__search-icon', '⌕'),
      searchInput
    ]);

    const profile = el('button.header__profile', {
      type: 'button',
      'aria-label': 'Открыть профиль',
      onclick: onProfile
    }, [
      el('img.header__avatar', {
        src: '/covers/avatar.svg',
        alt: 'Аватар',
      }),

      el('span.header__username', user?.username ?? 'username'),
      el('span.header__chevron', '>')
    ]) as HTMLButtonElement;

    this.el = el('header.header', [
      search,
      el('div.header__actions', [profile])
    ]) as HTMLElement;
  }
}
