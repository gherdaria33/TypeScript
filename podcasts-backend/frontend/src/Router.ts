import { AuthPage } from './pages/AuthPage';
import { MainPage } from './pages/MainPage';
import { FavouritePage } from './pages/FavouritePage';
import { ProfilePage } from './pages/ProfilePage';
import { Player } from './components/Player';
import { authService } from './services/authService';

type Route = 'tracks' | 'favorites' | 'profile';

export class Router {
  private root: HTMLElement;
  private shell: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
    this.shell = elShell();
    this.root.append(this.shell);
    window.addEventListener('popstate', () => this.render());
  }

  start(): void {
    if (!authService.isAuthenticated()) {
      this.showAuth();
    } else {
      this.navigate(this.getRoute());
    }
  }

  private getRoute(): Route {
    const path = window.location.pathname;
    if (path === '/favorites') return 'favorites';
    if (path === '/profile') return 'profile';
    return 'tracks';
  }

  navigate(route: Route): void {
    const path = route === 'tracks' ? '/' : `/${route}`;
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    this.render();
  }

  private render(): void {
    if (!authService.isAuthenticated()) {
      this.showAuth();
      return;
    }

    this.showApp(this.getRoute());
  }

  private showAuth(): void {
    this.root.replaceChildren(new AuthPage(() => {
      window.history.replaceState({}, '', '/');
      this.showApp('tracks');
    }).el);
  }

  private showApp(route: Route): void {
    const page =
      route === 'favorites' ? new FavouritePage() :
      route === 'profile' ? new ProfilePage() :
      new MainPage();

    const user = authService.getUser();
    const header = document.createElement('header');
    header.className = 'header';
    header.innerHTML = `
      <div class="header__brand"><span class="header__brand-mark">♫</span><span>Audio Player</span></div>
      <div class="header__actions">
        <button class="header__profile" type="button">
          <span class="header__avatar">${(user?.username?.[0] ?? 'U').toUpperCase()}</span>
          <span class="header__username">${user?.username ?? 'Пользователь'}</span>
        </button>
        <button class="header__logout" type="button">Выйти</button>
      </div>
    `;

    header.querySelector('.header__profile')?.addEventListener('click', () => this.navigate('profile'));
    header.querySelector('.header__logout')?.addEventListener('click', () => {
      authService.logout();
      this.showAuth();
    });

    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';
    sidebar.innerHTML = `
      <nav class="sidebar__nav">
        <button class="sidebar__item ${route === 'tracks' ? 'sidebar__item--active' : ''}" data-route="tracks">▣ <span>Все композиции</span></button>
        <button class="sidebar__item ${route === 'favorites' ? 'sidebar__item--active' : ''}" data-route="favorites">♡ <span>Избранное</span></button>
        <button class="sidebar__item ${route === 'profile' ? 'sidebar__item--active' : ''}" data-route="profile">◉ <span>Профиль</span></button>
      </nav>
    `;

    sidebar.querySelectorAll<HTMLButtonElement>('[data-route]').forEach(button => {
      button.addEventListener('click', () => this.navigate(button.dataset.route as Route));
    });

    const playerMount = document.createElement('div');
    playerMount.className = 'player-mount';

    const layout = document.createElement('div');
    layout.className = 'app';
    layout.append(header, sidebar, page.el, playerMount);

    this.root.replaceChildren(layout);

    // Player is created once per route to keep DOM simple and avoid stale page handlers.
    const player = new Player();
    playerMount.append(player.el);
  }
}

function elShell(): HTMLElement {
  const node = document.createElement('div');
  node.id = 'app-shell';
  return node;
}

function requirePlayer(): typeof import('./components/Player').Player {
  // Static ESM import would also work; this wrapper keeps Router self-contained.
  // The module is already bundled by Vite.
  throw new Error('PLAYER_IMPORT_PLACEHOLDER');
}