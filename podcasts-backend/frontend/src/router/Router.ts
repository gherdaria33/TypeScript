import { AuthPage } from '../view/pages/AuthPage';
import { MainPage } from '../view/pages/MainPage';
import { FavouritePage } from '../view/pages/FavouritePage';

const TOKEN_KEY = 'audio_player_token';
const USERNAME_KEY = 'audio_player_username';

type Route =
  | '/'
  | '/favorites'
  | '/login'
  | '/register';

export class Router {
  private readonly root: HTMLElement;

  private currentRoute: Route | null =
    null;

  public constructor(
    root: HTMLElement,
  ) {
    this.root = root;
  }

  public async start(): Promise<void> {
    window.addEventListener(
      'popstate',
      () => {
        void this.renderCurrentRoute();
      },
    );

    await this.renderCurrentRoute();
  }

  public navigate(
    path: string,
  ): void {
    const route =
      this.normalizeRoute(
        path,
      );

    if (
      route === this.currentRoute
    ) {
      return;
    }

    window.history.pushState(
      {},
      '',
      route,
    );

    void this.renderRoute(
      route,
    );
  }

  public replaceRoute(
    path: string,
  ): void {
    const route =
      this.normalizeRoute(
        path,
      );

    if (
      route === this.currentRoute
    ) {
      return;
    }

    window.history.replaceState(
      {},
      '',
      route,
    );

    void this.renderRoute(
      route,
    );
  }

  private async renderCurrentRoute(): Promise<void> {
    const route =
      this.normalizeRoute(
        window.location.pathname,
      );

    await this.renderRoute(
      route,
    );
  }

  private async renderRoute(
    route: Route,
  ): Promise<void> {
    this.currentRoute =
      route;

    if (
      route === '/login'
    ) {
      this.renderLogin();

      return;
    }

    if (
      route === '/register'
    ) {
      this.renderRegister();

      return;
    }

    const token =
      localStorage.getItem(
        TOKEN_KEY,
      );

    const username =
      localStorage.getItem(
        USERNAME_KEY,
      );

    if (!token) {
      this.redirectToLogin();

      return;
    }

    if (
      route === '/'
    ) {
      const page =
        new MainPage(
          this.root,
          this,
          token,
          username ?? 'Пользователь',
        );

      await page.render();

      return;
    }

    if (
      route === '/favorites'
    ) {
      const page =
        new FavouritePage(
          this.root,
          this,
          token,
          username ?? 'Пользователь',
        );

      await page.render();

      return;
    }

    this.redirectToHome();
  }

  private renderLogin(): void {
    const page =
      new AuthPage(
        this.root,
        this,
        'login',
      );

    page.render();
  }

  private renderRegister(): void {
    const page =
      new AuthPage(
        this.root,
        this,
        'register',
      );

    page.render();
  }

  private redirectToLogin(): void {
    if (
      this.currentRoute ===
      '/login'
    ) {
      return;
    }

    this.replaceRoute(
      '/login',
    );
  }

  private redirectToHome(): void {
    if (
      this.currentRoute === '/'
    ) {
      return;
    }

    this.replaceRoute(
      '/',
    );
  }

  private normalizeRoute(
    path: string,
  ): Route {
    const cleanPath =
      path.split('?')[0];

    if (
      cleanPath ===
      '/favorites'
    ) {
      return '/favorites';
    }

    if (
      cleanPath ===
      '/login'
    ) {
      return '/login';
    }

    if (
      cleanPath ===
      '/register'
    ) {
      return '/register';
    }

    return '/';
  }
}