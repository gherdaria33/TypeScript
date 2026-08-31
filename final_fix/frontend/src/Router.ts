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
    window.addEventListener('auth-expired', () => this.render());
  }

  start(): void { this.render(); }

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
    if (window.location.pathname !== path) window.history.pushState({}, '', path);
    this.render();
  }

  private showAuth(): void {
    this.root.replaceChildren(new AuthPage(() => {
      window.history.replaceState({}, '', '/');
      this.render();
    }).el);
  }

  private showApp(route: Route): void {
    const header = new Header(() => this.navigate('profile'));
    const sidebar = new Sidebar(
      route,
      () => this.navigate('tracks'),
      () => this.navigate('favorites'),
      () => this.navigate('profile')
    );

    const page = route === 'favorites'
      ? new FavouritePage(() => this.navigate('tracks'))
      : route === 'profile'
        ? new ProfilePage()
        : new MainPage(() => this.navigate('favorites'));

    const layout = document.createElement('div');
    layout.className = 'app';
    layout.append(header.el, sidebar.el, page.el, new Player().el);
    this.root.replaceChildren(layout);
  }
}
