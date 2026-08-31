import { el } from 'redom';
import { authService } from '../services/authService';

export class ProfilePage {
  public readonly el: HTMLElement;

  constructor() {
    const user = authService.getUser();

    this.el = el('main.page', [
      el('div.page__heading', [
        el('div', [
          el('div.page__eyebrow', 'Аккаунт'),
          el('h1.page__title', 'Профиль'),
          el('p.page__subtitle', 'Основная информация вашего аккаунта.')
        ])
      ]),
      el('section.profile-card', [
        el('img.profile-card__avatar', {
          src: '/covers/avatar.svg',
          alt: 'Аватар пользователя',
        }),

        el('div.profile-card__body', [
          el('div.profile-card__label', 'Имя пользователя'),
          el('div.profile-card__name', user?.username ?? 'Пользователь'),
          el('div.profile-card__hint', 'Аватар используется как заглушка.')
        ])
      ])
    ]) as HTMLElement;
  }
}