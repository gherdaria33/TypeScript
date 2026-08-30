export class Side {
  private root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  render(): void {
    this.root.innerHTML = `
      <aside
        class="sidebar"
        id="sidebar"
      >

        <div class="sidebar__top">

          <div class="sidebar__title">
            <span class="sidebar__title-icon">
              ♪
            </span>

            <div>
              <strong>AudioPlayer</strong>

              <span>
                Your music space
              </span>
            </div>
          </div>

          <button
            id="sidebar-close"
            class="sidebar__close"
            type="button"
            aria-label="Закрыть меню"
          >
            ×
          </button>

        </div>

        <nav class="sidebar__nav">

          <button
            class="sidebar__link"
            data-route="/"
            type="button"
          >
            <span class="sidebar__icon">
              ⌂
            </span>

            <span>
              Главная
            </span>
          </button>

          <button
            class="sidebar__link"
            data-route="/favorites"
            type="button"
          >
            <span class="sidebar__icon">
              ♡
            </span>

            <span>
              Избранное
            </span>
          </button>

          <button
            class="sidebar__link"
            data-route="/profile"
            type="button"
          >
            <span class="sidebar__icon">
              ◉
            </span>

            <span>
              Профиль
            </span>
          </button>

        </nav>

        <div class="sidebar__bottom">

          <div class="sidebar__hint">
            <span class="sidebar__hint-icon">
              ♪
            </span>

            <div>
              <strong>
                Хорошего прослушивания
              </strong>

              <span>
                Найдите музыку для любого настроения.
              </span>
            </div>
          </div>

          <button
            id="sidebar-logout"
            class="sidebar__logout"
            type="button"
          >
            <span>
              ↪
            </span>

            Выйти
          </button>

        </div>

      </aside>

      <div
        id="sidebar-overlay"
        class="sidebar-overlay"
      ></div>
    `;

    this.bindEvents();
    this.updateActiveRoute();
  }

  private bindEvents(): void {
    const routeButtons =
      this.root.querySelectorAll<HTMLButtonElement>(
        '[data-route]',
      );

    routeButtons.forEach(
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
            this.close();
          },
        );
      },
    );

    const closeButton =
      this.root.querySelector<HTMLButtonElement>(
        '#sidebar-close',
      );

    closeButton?.addEventListener(
      'click',
      () => {
        this.close();
      },
    );

    const overlay =
      this.root.querySelector<HTMLElement>(
        '#sidebar-overlay',
      );

    overlay?.addEventListener(
      'click',
      () => {
        this.close();
      },
    );

    const logout =
      this.root.querySelector<HTMLButtonElement>(
        '#sidebar-logout',
      );

    logout?.addEventListener(
      'click',
      () => {
        window.dispatchEvent(
          new CustomEvent(
            'logout',
          ),
        );
      },
    );

    window.addEventListener(
      'toggle-sidebar',
      () => {
        this.toggle();
      },
    );

    window.addEventListener(
      'route-changed',
      () => {
        this.updateActiveRoute();
        this.close();
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

  private updateActiveRoute(): void {
    const currentRoute =
      window.location.pathname;

    const links =
      this.root.querySelectorAll<HTMLButtonElement>(
        '.sidebar__link',
      );

    links.forEach(
      (link) => {
        const route =
          link.dataset.route;

        const active =
          route === currentRoute ||
          (
            route === '/' &&
            (
              currentRoute === '' ||
              currentRoute === '/'
            )
          );

        link.classList.toggle(
          'sidebar__link--active',
          active,
        );
      },
    );
  }

  private toggle(): void {
    const sidebar =
      this.root.querySelector<HTMLElement>(
        '#sidebar',
      );

    const overlay =
      this.root.querySelector<HTMLElement>(
        '#sidebar-overlay',
      );

    sidebar?.classList.toggle(
      'sidebar--open',
    );

    overlay?.classList.toggle(
      'sidebar-overlay--visible',
    );

    document.body.classList.toggle(
      'sidebar-open',
    );
  }

  private close(): void {
    const sidebar =
      this.root.querySelector<HTMLElement>(
        '#sidebar',
      );

    const overlay =
      this.root.querySelector<HTMLElement>(
        '#sidebar-overlay',
      );

    sidebar?.classList.remove(
      'sidebar--open',
    );

    overlay?.classList.remove(
      'sidebar-overlay--visible',
    );

    document.body.classList.remove(
      'sidebar-open',
    );
  }
}