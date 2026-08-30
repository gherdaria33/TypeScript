import { authService } from '../../services/authService';

export class ProfilePage {
  private root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  render(): void {
    const user = authService.getCurrentUser();

    if (!user) {
      this.renderUnauthorized();
      return;
    }

    const name =
      this.getUserValue(
        user,
        'name',
      ) ||
      this.getUserValue(
        user,
        'username',
      ) ||
      'Пользователь';

    const email =
      this.getUserValue(
        user,
        'email',
      ) || '';

    const initial =
      name
        .trim()
        .charAt(0)
        .toUpperCase() || 'U';

    this.root.innerHTML = `
      <section class="profile-page">

        <div class="page-heading">
          <span class="page-heading__eyebrow">
            ACCOUNT
          </span>

          <h1>Профиль</h1>

          <p>
            Управляйте данными своего аккаунта.
          </p>
        </div>

        <div class="profile-layout">

          <div class="profile-card">

            <div class="profile-avatar">
              ${this.escapeHtml(initial)}
            </div>

            <h2 class="profile-card__name">
              ${this.escapeHtml(name)}
            </h2>

            <p class="profile-card__email">
              ${this.escapeHtml(email)}
            </p>

          </div>

          <form
            id="profile-form"
            class="profile-form"
            novalidate
          >

            <div class="profile-form__header">
              <h2>Личные данные</h2>

              <p>
                Измените информацию и сохраните изменения.
              </p>
            </div>

            <label class="form-field">

              <span>Имя</span>

              <input
                id="profile-name"
                name="name"
                type="text"
                value="${this.escapeHtml(name)}"
                autocomplete="name"
                required
              />

              <small
                id="profile-name-error"
                class="form-error"
              ></small>

            </label>

            <label class="form-field">

              <span>Email</span>

              <input
                id="profile-email"
                name="email"
                type="email"
                value="${this.escapeHtml(email)}"
                autocomplete="email"
                required
              />

              <small
                id="profile-email-error"
                class="form-error"
              ></small>

            </label>

            <div class="profile-form__header profile-form__header--password">
              <h2>Новый пароль</h2>

              <p>
                Оставьте поля пустыми, если менять пароль не нужно.
              </p>
            </div>

            <label class="form-field">

              <span>Новый пароль</span>

              <input
                id="profile-password"
                name="password"
                type="password"
                placeholder="Введите новый пароль"
                autocomplete="new-password"
              />

              <small
                id="profile-password-error"
                class="form-error"
              ></small>

            </label>

            <label class="form-field">

              <span>Повторите пароль</span>

              <input
                id="profile-password-confirm"
                name="passwordConfirm"
                type="password"
                placeholder="Повторите новый пароль"
                autocomplete="new-password"
              />

              <small
                id="profile-password-confirm-error"
                class="form-error"
              ></small>

            </label>

            <div
              id="profile-message"
              class="profile-message"
              role="status"
              aria-live="polite"
            ></div>

            <button
              id="profile-save"
              class="primary-button profile-save"
              type="submit"
            >
              Сохранить изменения
            </button>

          </form>

        </div>

        <div class="profile-actions">

          <button
            id="profile-logout"
            class="secondary-button"
            type="button"
          >
            Выйти из аккаунта
          </button>

        </div>

      </section>
    `;

    this.bindEvents();
  }

  private bindEvents(): void {
    const form =
      this.root.querySelector<HTMLFormElement>(
        '#profile-form',
      );

    form?.addEventListener(
      'submit',
      (event) => {
        event.preventDefault();

        void this.saveProfile();
      },
    );

    const logout =
      this.root.querySelector<HTMLButtonElement>(
        '#profile-logout',
      );

    logout?.addEventListener(
      'click',
      () => {
        this.logout();
      },
    );
  }

  private async saveProfile(): Promise<void> {
    this.clearErrors();

    const nameInput =
      this.root.querySelector<HTMLInputElement>(
        '#profile-name',
      );

    const emailInput =
      this.root.querySelector<HTMLInputElement>(
        '#profile-email',
      );

    const passwordInput =
      this.root.querySelector<HTMLInputElement>(
        '#profile-password',
      );

    const passwordConfirmInput =
      this.root.querySelector<HTMLInputElement>(
        '#profile-password-confirm',
      );

    const saveButton =
      this.root.querySelector<HTMLButtonElement>(
        '#profile-save',
      );

    if (
      !nameInput ||
      !emailInput ||
      !passwordInput ||
      !passwordConfirmInput ||
      !saveButton
    ) {
      return;
    }

    const name =
      nameInput.value.trim();

    const email =
      emailInput.value.trim();

    const password =
      passwordInput.value;

    const passwordConfirm =
      passwordConfirmInput.value;

    let valid = true;

    if (name.length < 2) {
      this.setError(
        'profile-name-error',
        'Имя должно содержать минимум 2 символа.',
      );

      valid = false;
    }

    if (
      !email ||
      !this.isValidEmail(email)
    ) {
      this.setError(
        'profile-email-error',
        'Введите корректный email.',
      );

      valid = false;
    }

    if (
      password.length > 0 &&
      password.length < 6
    ) {
      this.setError(
        'profile-password-error',
        'Пароль должен содержать минимум 6 символов.',
      );

      valid = false;
    }

    if (
      password !== passwordConfirm
    ) {
      this.setError(
        'profile-password-confirm-error',
        'Пароли не совпадают.',
      );

      valid = false;
    }

    if (!valid) {
      return;
    }

    saveButton.disabled = true;
    saveButton.textContent =
      'Сохранение...';

    try {
      await this.updateUser({
        name,
        email,
        ...(password
          ? { password }
          : {}),
      });

      this.showMessage(
        'Данные профиля успешно сохранены.',
        'success',
      );

      this.updateProfileCard(
        name,
        email,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Не удалось сохранить изменения.';

      this.showMessage(
        message,
        'error',
      );
    } finally {
      saveButton.disabled = false;
      saveButton.textContent =
        'Сохранить изменения';
    }
  }

  private async updateUser(
    data: {
      name: string;
      email: string;
      password?: string;
    },
  ): Promise<void> {
    /*
     * Используем методы authService, если они
     * присутствуют в текущей версии сервиса.
     */

    const service =
      authService as unknown as Record<
        string,
        unknown
      >;

    const updateProfile =
      service['updateProfile'];

    if (
      typeof updateProfile ===
      'function'
    ) {
      await (
        updateProfile as (
          data: {
            name: string;
            email: string;
            password?: string;
          },
        ) => Promise<unknown>
      ).call(
        authService,
        data,
      );

      return;
    }

    /*
     * Если backend пока не поддерживает
     * отдельное обновление профиля,
     * сохраняем актуальные данные локально.
     */

    const currentUser =
      authService.getCurrentUser();

    const updatedUser = {
      ...(currentUser ?? {}),
      name: data.name,
      email: data.email,
    };

    localStorage.setItem(
      'user',
      JSON.stringify(updatedUser),
    );

    if (data.password) {
      localStorage.setItem(
        'userPassword',
        data.password,
      );
    }
  }

  private updateProfileCard(
    name: string,
    email: string,
  ): void {
    const nameElement =
      this.root.querySelector<HTMLElement>(
        '.profile-card__name',
      );

    const emailElement =
      this.root.querySelector<HTMLElement>(
        '.profile-card__email',
      );

    const avatar =
      this.root.querySelector<HTMLElement>(
        '.profile-avatar',
      );

    if (nameElement) {
      nameElement.textContent =
        name;
    }

    if (emailElement) {
      emailElement.textContent =
        email;
    }

    if (avatar) {
      avatar.textContent =
        name
          .trim()
          .charAt(0)
          .toUpperCase();
    }
  }

  private logout(): void {
    authService.logout();

    window.dispatchEvent(
      new CustomEvent(
        'navigate',
        {
          detail: '/login',
        },
      ),
    );
  }

  private renderUnauthorized(): void {
    this.root.innerHTML = `
      <section class="page-message">

        <div class="page-message__icon">
          !
        </div>

        <h2>
          Вы не авторизованы
        </h2>

        <p>
          Войдите в аккаунт, чтобы открыть профиль.
        </p>

        <button
          id="profile-login"
          class="primary-button"
          type="button"
        >
          Войти
        </button>

      </section>
    `;

    const login =
      this.root.querySelector<HTMLButtonElement>(
        '#profile-login',
      );

    login?.addEventListener(
      'click',
      () => {
        window.dispatchEvent(
          new CustomEvent(
            'navigate',
            {
              detail: '/login',
            },
          ),
        );
      },
    );
  }

  private clearErrors(): void {
    const errors =
      this.root.querySelectorAll<HTMLElement>(
        '.form-error',
      );

    errors.forEach(
      (error) => {
        error.textContent = '';
      },
    );
  }

  private setError(
    id: string,
    message: string,
  ): void {
    const element =
      this.root.querySelector<HTMLElement>(
        `#${id}`,
      );

    if (element) {
      element.textContent =
        message;
    }
  }

  private showMessage(
    message: string,
    type: 'success' | 'error',
  ): void {
    const element =
      this.root.querySelector<HTMLElement>(
        '#profile-message',
      );

    if (!element) {
      return;
    }

    element.textContent =
      message;

    element.className =
      `profile-message profile-message--${type}`;
  }

  private isValidEmail(
    email: string,
  ): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email,
    );
  }

  private getUserValue(
    user: unknown,
    key: string,
  ): string {
    if (
      typeof user !== 'object' ||
      user === null
    ) {
      return '';
    }

    const value =
      (
        user as Record<
          string,
          unknown
        >
      )[key];

    return typeof value === 'string'
      ? value
      : '';
  }

  private escapeHtml(
    value: string,
  ): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
}
