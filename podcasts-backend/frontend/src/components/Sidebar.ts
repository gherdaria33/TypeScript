interface SidebarOptions {
  currentRoute?: string;
  onNavigate?: (
    route: string,
  ) => void;
}

interface NavigationItem {
  title: string;
  route: string;
  icon: string;
}

export class Sidebar {
  private readonly options: SidebarOptions;

  private readonly items:
    NavigationItem[] = [
      {
        title: 'Аудиокомпозиции',
        route: '/',
        icon: '♪',
      },
      {
        title: 'Избранное',
        route: '/favorites',
        icon: '♡',
      },
    ];

  public constructor(
    options: SidebarOptions = {},
  ) {
    this.options = options;
  }

  public render(
    container: HTMLElement,
  ): HTMLElement {
    const sidebar =
      document.createElement('aside');

    sidebar.className =
      'sidebar';

    const logo =
      document.createElement('div');

    logo.className =
      'sidebar__logo';

    logo.innerHTML = `
      <div class="sidebar__logo-mark">
        ♪
      </div>

      <span class="sidebar__logo-text">
        Audio
      </span>
    `;

    const navigation =
      document.createElement('nav');

    navigation.className =
      'sidebar__navigation';

    navigation.setAttribute(
      'aria-label',
      'Основная навигация',
    );

    this.items.forEach(
      (item) => {
        const button =
          document.createElement(
            'button',
          );

        button.type =
          'button';

        button.className =
          'sidebar__item';

        if (
          item.route ===
          this.options.currentRoute
        ) {
          button.classList.add(
            'sidebar__item--active',
          );
        }

        button.dataset.route =
          item.route;

        const icon =
          document.createElement(
            'span',
          );

        icon.className =
          'sidebar__item-icon';

        icon.textContent =
          item.icon;

        const text =
          document.createElement(
            'span',
          );

        text.className =
          'sidebar__item-text';

        text.textContent =
          item.title;

        button.append(
          icon,
          text,
        );

        button.addEventListener(
          'click',
          () => {
            this.options.onNavigate?.(
              item.route,
            );
          },
        );

        navigation.append(
          button,
        );
      },
    );

    const footer =
      document.createElement('div');

    footer.className =
      'sidebar__footer';

    footer.innerHTML = `
      <span class="sidebar__footer-text">
        AUDIO PLAYER
      </span>
    `;

    sidebar.append(
      logo,
      navigation,
      footer,
    );

    container.append(
      sidebar,
    );

    return sidebar;
  }
}