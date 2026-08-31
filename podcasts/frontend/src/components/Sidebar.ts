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
    ) => {
      return el(
        `button.sidebar__item${
          active === route ? '.sidebar__item--active' : ''
        }`,
        {
          type: 'button',
          onclick: action,
          'data-route': route,
        },
        [
          el('img.sidebar__icon', {
            src: icon,
            alt: '',
          }),

          el('img.sidebar__text', {
            src: text,
            alt: '',
          }),
        ]
      );
    };
   
    const logo = el('img.sidebar__logo', {
      src: '/covers/logo.svg',
      alt: 'VibeCast Studio',
    });
  
    this.el = el('aside.sidebar', [
      
        el('div.sidebar__brand', [
        logo,
        ]),


        el('nav.sidebar__nav', [

          button(
            'favorites',
          '/covers/Notes.svg',
          '/covers/text1.svg',
            onFavorites
          ),
        
        button(
          'tracks', 
          '/covers/Notes.svg',
          '/covers/text2.svg',
          onTracks
        ),
        ]),

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
    ]) as HTMLElement;
  }
}