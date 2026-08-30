import { el } from 'redom';
import { authService } from '../services/authService';

export class Header {
  public readonly el: HTMLElement;

  constructor(onProfile: () => void, onLogout: () => void) {
    const user = authService.getUser();
    const initial = (user?.username?.[0] ?? 'U').toUpperCase();

    const profile = el('button.header__profile', {
      type: 'button',
      'aria-label': 'Открыть профиль',
      onclick: onProfile
    }, [
      el('span.header__avatar', initial),
      el('span.header__username', user?.username ?? 'Пользователь')
    ]) as HTMLButtonElement;

    const logout = el('button.header__logout', {
      type: 'button',
      title: 'Выйти',
      'aria-label': 'Выйти',
      onclick: onLogout
    }, 'Выйти') as HTMLButtonElement;

    this.el = el('header.header', [
      el('div.header__mobile-title', 'Аудиокомпозиции'),
      el('div.header__actions', [profile, logout])
    ]) as HTMLElement;
  }
}
