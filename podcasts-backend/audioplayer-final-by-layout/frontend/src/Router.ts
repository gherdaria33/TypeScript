import { AuthPage } from './pages/AuthPage';
import { MainPage } from './pages/MainPage';
import { FavouritePage } from './pages/FavouritePage';
import { ProfilePage } from './pages/ProfilePage';
import { Player } from './components/Player';
import { authService } from './services/authService';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

type Route = 'tracks' | 'favorites' | 'profile';

export class Router {
  private readonly root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
    window.addEventListener('popstate', () => this.render());
  }

  start(): void {
    this.render();
  }

  private getRoute(): Route {
    if (window.location.pathname === '/favorites') return 'favorites';
    if (window.location.pathname === '/profile') return 'profile';
    return 'tracks';
  }

  private render(): void {
    if (!authService.isAuthenticated()) {
      this.showAuth();
      return;
    }
    this.showApp(this.getRoute());
  }

  navigate(route: Route): void {
    const path = route === 'tracks' ? '/' : `/${route}`;
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    this.render();
  }

  private showAuth(): void {
    this.root.replaceChildren(new AuthPage(() => {
      window.history.replaceState({}, '', '/');
      this.render();
    }).el);
  }

  private showApp(route: Route): void {
    const page = route === 'favorites'
      ? new FavouritePage()
      : route === 'profile'
        ? new ProfilePage()
        : new MainPage();

    const header = new Header(
      () => this.navigate('profile'),
      () => {
        authService.logout();
        this.render();
      }
    );

    const sidebar = new Sidebar(
      route,
      () => this.navigate('tracks'),
      () => this.navigate('favorites'),
      () => this.navigate('profile')
    );

    const layout = document.createElement('div');
    layout.className = 'app';
    layout.append(header.el, sidebar.el, page.el);

    const playerMount = document.createElement('div');
    playerMount.className = 'player-mount';
    playerMount.append(new Player().el);
    layout.append(playerMount);

    this.root.replaceChildren(layout);
  }
}
