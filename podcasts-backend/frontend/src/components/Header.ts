import { el } from 'redom';
import { authService } from '../services/authService';

export class Header {
  public readonly el: HTMLElement;
  private onProfile: () => void;
  private onLogout: () => void;

  constructor(onProfile: () => void, onLogout: () => void) {
    this.onProfile = onProfile;
    this.onLogout = onLogout;

    const user = authService.getUser();
    const profile = el('button.header__profile', {
      type: 'button',
      onclick: () => this.onProfile()
    }, [
      el('span.header__avatar', (user?.username?.[0] ?? 'U').toUpperCase()),
      el('span.header__username', user?.username ?? 'Пользователь')
    ]) as HTMLButtonElement;

    const logout = el('button.header__logout', {
      type: 'button',
      onclick: () => this.onLogout()
    }, 'Выйти') as HTMLButtonElement;

    this.el = el('header.header', [
      el('div.header__brand', [
        el('span.header__brand-mark', '♫'),
        el('span', 'Audio Player')
      ]),
      el('div.header__actions', [profile, logout])
    ]) as HTMLElement;
  }
}