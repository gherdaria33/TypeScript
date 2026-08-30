import { authService } from '../../services/authService';

export class Header {
  private root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  render(): void {
    const user =
      authService.getCurrentUser();

    const userName =
      user?.name ||
      user?.username ||
      'Пользователь';

    const userEmail =
      user?.email ||
      '';

    const initials =
      this.getInitials(
        userName,
      );

    const currentRoute =
      this.getCurrentRoute();

    this.root.innerHTML = `
      <header class="header">

        <div class="header__left">

          <button
            id="header-menu"
            class="header__menu"
            type="button"
            aria-label="Открыть меню"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <button
            id="header-logo"
            class="header__logo"
            type="button"
            aria-label="AudioPlayer"
          >
            <span class="header__logo-icon">
              ♪
            </span>

            <span class="header__logo-text">
              AudioPlayer
            </span>
          </button>

          <nav class="header__nav">

            <button
              class="
                header__nav-link
                ${
                  currentRoute === '/'
                    ? 'header__nav-link--active'
                    : ''
                }
              "
              data-route="/"
              type="button"
            >
              Главная
            </button>

            <button
              class="
                header__nav-link
                ${
                  currentRoute ===
                  '/favorites'
                    ? 'header__nav-link--active'
                    : ''
                }
              "
              data-route="/favorites"
              type="button"
            >
              Избранное
            </button>

          </nav>

        </div>

        <div class="header__right">

          <button
            id="header-profile"
            class="header__profile"
            type="button"
            aria-label="Открыть профиль"
          >

            <span class="header__avatar">
              ${this.escapeHtml(
                initials,
              )}
            </span>

            <span class="header__profile-info">

              <strong>
                ${this.escapeHtml(
                  userName,
                )}
              </strong>

              <small>
                ${this.escapeHtml(
                  userEmail,
                )}
              </small>

            </span>

            <span
              class="header__profile-arrow"
            >
              ›
            </span>

          </button>

        </div>

      </header>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    const menu =
      this.root.querySelector<HTMLButtonElement>(
        '#header-menu',
      );

    menu?.addEventListener(
      'click',
      () => {
        window.dispatchEvent(
          new CustomEvent(
            'toggle-sidebar',
          ),
        );
      },
    );

    const logo =
      this.root.querySelector<HTMLButtonElement>(
        '#header-logo',
      );

    logo?.addEventListener(
      'click',
      () => {
        this.navigate('/');
      },
    );

    const routes =
      this.root.querySelectorAll<HTMLButtonElement>(
        '[data-route]',
      );

    routes.forEach(
      (button) => {
        button.addEventListener(
          'click',
          () => {
            const route =
              button.dataset.route;

            if (!route) {
              return;
            }

            this.navigate(route);
          },
        );
      },
    );

    const profile =
      this.root.querySelector<HTMLButtonElement>(
        '#header-profile',
      );

    profile?.addEventListener(
      'click',
      () => {
        this.navigate(
          '/profile',
        );
      },
    );

    window.addEventListener(
      'route-changed',
      () => {
        this.render();
      },
    );

    window.addEventListener(
      'user-updated',
      () => {
        this.render();
      },
    );

    window.addEventListener(
      'logout',
      () => {
        authService.logout();

        this.navigate(
          '/login',
        );
      },
    );
  }

  private navigate(
    route: string,
  ): void {
    window.dispatchEvent(
      new CustomEvent(
        'navigate',
        {
          detail: route,
        },
      ),
    );
  }

  private getCurrentRoute(): string {
    const path =
      window.location.pathname;

    if (!path) {
      return '/';
    }

    return path.replace(
      /\/$/,
      '',
    ) || '/';
  }

  private getInitials(
    name: string,
  ): string {
    const parts =
      name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (
      parts.length === 0
    ) {
      return 'U';
    }

    if (
      parts.length === 1
    ) {
      return parts[0]
        .slice(0, 2)
        .toUpperCase();
    }

    return (
      parts[0][0] +
      parts[1][0]
    ).toUpperCase();
  }

  private escapeHtml(
    value: string,
  ): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll(
        "'",
        '&#039;',
      );
  }
}