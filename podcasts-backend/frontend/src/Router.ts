import { AuthPage } from './view/pages/AuthPage';
import { MainPage } from './view/pages/MainPage';
import { FavouritePage } from './view/pages/FavouritePage';
import { ProfilePage } from './view/pages/ProfilePage';

import { authService } from './services/authService';

export class Router {
  private root: HTMLElement;

  private currentPage:
    | MainPage
    | FavouritePage
    | ProfilePage
    | AuthPage
    | null = null;

  constructor(root: HTMLElement) {
    this.root = root;

    window.addEventListener(
      'navigate',
      (event) => {
        const customEvent =
          event as CustomEvent<string>;

        this.navigate(
          customEvent.detail,
        );
      },
    );

    window.addEventListener(
      'popstate',
      () => {
        void this.renderCurrentRoute();
      },
    );
  }

  async start(): Promise<void> {
    await this.renderCurrentRoute();
  }

  async navigate(
    route: string,
  ): Promise<void> {
    const normalizedRoute =
      this.normalizeRoute(route);

    if (
      window.location.pathname !==
      normalizedRoute
    ) {
      window.history.pushState(
        {},
        '',
        normalizedRoute,
      );
    }

    await this.renderCurrentRoute();
  }

  private async renderCurrentRoute(): Promise<void> {
    const route =
      this.normalizeRoute(
        window.location.pathname,
      );

    const isAuthenticated =
      authService.isAuthenticated();

    /*
     * Если пользователь не авторизован,
     * закрытые страницы отправляем на login.
     */

    if (
      !isAuthenticated &&
      route !== '/login'
    ) {
      await this.navigate('/login');
      return;
    }

    /*
     * Авторизованный пользователь,
     * который открывает /login,
     * отправляется на главную.
     */

    if (
      isAuthenticated &&
      route === '/login'
    ) {
      await this.navigate('/');
      return;
    }

    switch (route) {
      case '/login':
        await this.showAuthPage();
        break;

      case '/':
        await this.showMainPage();
        break;

      case '/favorites':
        await this.showFavouritePage();
        break;

      case '/profile':
        this.showProfilePage();
        break;

      default:
        await this.navigate('/');
        return;
    }

    window.dispatchEvent(
      new CustomEvent(
        'route-changed',
        {
          detail: route,
        },
      ),
    );
  }

  private async showMainPage(): Promise<void> {
    const page =
      new MainPage(this.root);

    this.currentPage = page;

    await page.render();
  }

  private async showFavouritePage(): Promise<void> {
    const page =
      new FavouritePage(
        this.root,
      );

    this.currentPage = page;

    await page.render();
  }

  private showProfilePage(): void {
    const page =
      new ProfilePage(
        this.root,
      );

    this.currentPage = page;

    page.render();
  }

  private async showAuthPage(): Promise<void> {
    const page =
      new AuthPage(this.root);

    this.currentPage = page;

    await page.render();
  }

  private normalizeRoute(
    route: string,
  ): string {
    if (!route) {
      return '/';
    }

    let normalized =
      route.trim();

    /*
     * Если передали полный URL,
     * берём только pathname.
     */

    try {
      if (
        normalized.startsWith(
          'http://',
        ) ||
        normalized.startsWith(
          'https://',
        )
      ) {
        normalized =
          new URL(
            normalized,
          ).pathname;
      }
    } catch {
      normalized = '/';
    }

    /*
     * Убираем query/hash.
     */

    normalized =
      normalized.split('?')[0];

    normalized =
      normalized.split('#')[0];

    /*
     * Добавляем / в начало.
     */

    if (
      !normalized.startsWith('/')
    ) {
      normalized =
        `/${normalized}`;
    }

    /*
     * Убираем лишний / в конце.
     */

    if (
      normalized.length > 1 &&
      normalized.endsWith('/')
    ) {
      normalized =
        normalized.slice(0, -1);
    }

    return normalized;
  }
}