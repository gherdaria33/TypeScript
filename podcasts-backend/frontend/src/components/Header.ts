interface HeaderOptions {
  username: string;
  onSearch?: (value: string) => void;
}

export class Header {
  private readonly options: HeaderOptions;

  public constructor(
    options: HeaderOptions,
  ) {
    this.options = options;
  }

  public render(
    container: HTMLElement,
  ): HTMLElement {
    const header =
      document.createElement('header');

    header.className =
      'header';

    const searchWrapper =
      document.createElement('div');

    searchWrapper.className =
      'header__search';

    const searchIcon =
      document.createElement('span');

    searchIcon.className =
      'header__search-icon';

    searchIcon.innerHTML = `
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="11"
          cy="11"
          r="7"
          stroke="currentColor"
          stroke-width="1.8"
        />
        <path
          d="M16.5 16.5L21 21"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
        />
      </svg>
    `;

    const input =
      document.createElement('input');

    input.className =
      'header__search-input';

    input.type =
      'search';

    input.placeholder =
      'Поиск композиции...';

    input.autocomplete =
      'off';

    input.setAttribute(
      'aria-label',
      'Поиск композиции',
    );

    searchWrapper.append(
      searchIcon,
      input,
    );

    const user =
      document.createElement('div');

    user.className =
      'header__user';

    const avatar =
      document.createElement('div');

    avatar.className =
      'header__avatar';

    avatar.textContent =
      this.getInitial(
        this.options.username,
      );

    const username =
      document.createElement('span');

    username.className =
      'header__username';

    username.textContent =
      this.options.username;

    user.append(
      avatar,
      username,
    );

    header.append(
      searchWrapper,
      user,
    );

    input.addEventListener(
      'input',
      () => {
        this.options.onSearch?.(
          input.value,
        );
      },
    );

    container.append(
      header,
    );

    return header;
  }

  private getInitial(
    username: string,
  ): string {
    const value =
      username.trim();

    if (!value) {
      return '?';
    }

    return value
      .charAt(0)
      .toUpperCase();
  }
}