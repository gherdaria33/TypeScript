import { authService } from '../../services/authService';

type AuthMode = 'login' | 'register';

export class AuthPage {
  private root: HTMLElement;
  private mode: AuthMode = 'login';

  constructor(root: HTMLElement) {
    this.root = root;
  }

  async render(
    mode: AuthMode = 'login',
  ): Promise<void> {
    this.mode = mode;

    this.renderPage();
    this.bindEvents();
  }

  private renderPage(): void {
    const isLogin =
      this.mode === 'login';

    this.root.innerHTML = `
      <main class="auth-page">

        <section class="auth-card">

          <div class="auth-logo">

            <span class="auth-logo__icon">
              ♪
            </span>

            <span>
              AudioPlayer
            </span>

          </div>

          <div class="auth-header">

            <h1>
              ${
                isLogin
                  ? 'С возвращением!'
                  : 'Создать аккаунт'
              }
            </h1>

            <p>
              ${
                isLogin
                  ? 'Войдите, чтобы продолжить слушать музыку'
                  : 'Зарегистрируйтесь и создайте свою коллекцию'
              }
            </p>

          </div>

          <form
            id="auth-form"
            class="auth-form"
            novalidate
          >

            ${
              !isLogin
                ? `
                  <div class="form-group">

                    <label for="auth-name">
                      Имя
                    </label>

                    <input
                      id="auth-name"
                      name="name"
                      type="text"
                      placeholder="Введите ваше имя"
                      autocomplete="name"
                    />

                    <span
                      id="auth-name-error"
                      class="form-error"
                    ></span>

                  </div>
                `
                : ''
            }

            <div class="form-group">

              <label for="auth-email">
                Email
              </label>

              <input
                id="auth-email"
                name="email"
                type="email"
                placeholder="example@mail.com"
                autocomplete="email"
              />

              <span
                id="auth-email-error"
                class="form-error"
              ></span>

            </div>

            <div class="form-group">

              <label for="auth-password">
                Пароль
              </label>

              <div class="password-wrapper">

                <input
                  id="auth-password"
                  name="password"
                  type="password"
                  placeholder="Введите пароль"
                  autocomplete="${
                    isLogin
                      ? 'current-password'
                      : 'new-password'
                  }"
                />

                <button
                  id="password-toggle"
                  class="password-toggle"
                  type="button"
                  aria-label="Показать пароль"
                >
                  👁
                </button>

              </div>

              <span
                id="auth-password-error"
                class="form-error"
              ></span>

            </div>

            <div
              id="auth-general-error"
              class="form-error form-error--general"
              role="alert"
            ></div>

            <button
              id="auth-submit"
              class="auth-submit"
              type="submit"
            >
              ${
                isLogin
                  ? 'Войти'
                  : 'Зарегистрироваться'
              }
            </button>

          </form>

          <div class="auth-switch">

            <span>
              ${
                isLogin
                  ? 'Нет аккаунта?'
                  : 'Уже есть аккаунт?'
              }
            </span>

            <button
              id="auth-switch-button"
              class="auth-switch__button"
              type="button"
            >
              ${
                isLogin
                  ? 'Зарегистрироваться'
                  : 'Войти'
              }
            </button>

          </div>

          ${
            isLogin
              ? `
                <button
                  id="guest-button"
                  class="guest-button"
                  type="button"
                >
                  Продолжить без аккаунта
                </button>
              `
              : ''
          }

        </section>

      </main>
    `;
  }

  private bindEvents(): void {
    const form =
      this.root.querySelector<HTMLFormElement>(
        '#auth-form',
      );

    form?.addEventListener(
      'submit',
      (event) => {
        event.preventDefault();

        void this.submitForm(form);
      },
    );

    const switchButton =
      this.root.querySelector<HTMLButtonElement>(
        '#auth-switch-button',
      );

    switchButton?.addEventListener(
      'click',
      () => {
        if (this.mode === 'login') {
          this.navigate('/register');
        } else {
          this.navigate('/login');
        }
      },
    );

    const guestButton =
      this.root.querySelector<HTMLButtonElement>(
        '#guest-button',
      );

    guestButton?.addEventListener(
      'click',
      () => {
        this.navigate('/');
      },
    );

    const passwordToggle =
      this.root.querySelector<HTMLButtonElement>(
        '#password-toggle',
      );

    const passwordInput =
      this.root.querySelector<HTMLInputElement>(
        '#auth-password',
      );

    passwordToggle?.addEventListener(
      'click',
      () => {
        if (!passwordInput) {
          return;
        }

        const isPassword =
          passwordInput.type === 'password';

        passwordInput.type =
          isPassword
            ? 'text'
            : 'password';

        passwordToggle.textContent =
          isPassword
            ? '🙈'
            : '👁';

        passwordToggle.setAttribute(
          'aria-label',
          isPassword
            ? 'Скрыть пароль'
            : 'Показать пароль',
        );
      },
    );

    const inputs =
      this.root.querySelectorAll<HTMLInputElement>(
        '#auth-form input',
      );

    inputs.forEach((input) => {
      input.addEventListener(
        'input',
        () => {
          this.clearInputError(
            input.id,
          );
        },
      );
    });
  }

  private async submitForm(
    form: HTMLFormElement,
  ): Promise<void> {
    this.clearErrors();

    const emailInput =
      form.querySelector<HTMLInputElement>(
        '#auth-email',
      );

    const passwordInput =
      form.querySelector<HTMLInputElement>(
        '#auth-password',
      );

    const nameInput =
      form.querySelector<HTMLInputElement>(
        '#auth-name',
      );

    if (
      !emailInput ||
      !passwordInput
    ) {
      return;
    }

    const email =
      emailInput.value.trim();

    const password =
      passwordInput.value;

    const name =
      nameInput?.value.trim() ?? '';

    let isValid = true;

    if (!email) {
      this.showError(
        'auth-email-error',
        'Введите email',
      );

      this.markInputError(
        emailInput,
      );

      isValid = false;
    } else if (
      !this.isValidEmail(email)
    ) {
      this.showError(
        'auth-email-error',
        'Введите корректный email',
      );

      this.markInputError(
        emailInput,
      );

      isValid = false;
    }

    if (!password) {
      this.showError(
        'auth-password-error',
        'Введите пароль',
      );

      this.markInputError(
        passwordInput,
      );

      isValid = false;
    } else if (
      password.length < 6
    ) {
      this.showError(
        'auth-password-error',
        'Пароль должен содержать минимум 6 символов',
      );

      this.markInputError(
        passwordInput,
      );

      isValid = false;
    }

    if (
      this.mode === 'register' &&
      !name
    ) {
      if (nameInput) {
        this.showError(
          'auth-name-error',
          'Введите имя',
        );

        this.markInputError(
          nameInput,
        );
      }

      isValid = false;
    }

    if (!isValid) {
      return;
    }

    const submitButton =
      form.querySelector<HTMLButtonElement>(
        '#auth-submit',
      );

    if (submitButton) {
      submitButton.disabled = true;

      submitButton.textContent =
        this.mode === 'login'
          ? 'Вход...'
          : 'Регистрация...';
    }

    try {
      if (this.mode === 'login') {
        await this.login(
          email,
          password,
        );
      } else {
        await this.register(
          name,
          email,
          password,
        );
      }
    } catch (error) {
      this.handleError(error);

      if (submitButton) {
        submitButton.disabled = false;

        submitButton.textContent =
          this.mode === 'login'
            ? 'Войти'
            : 'Зарегистрироваться';
      }
    }
  }

  private async login(
    email: string,
    password: string,
  ): Promise<void> {
    await authService.login(
      email,
      password,
    );

    this.navigate('/');
  }

  private async register(
    name: string,
    email: string,
    password: string,
  ): Promise<void> {
    await authService.register(
      name,
      email,
      password,
    );

    this.navigate('/');
  }

  private handleError(
    error: unknown,
  ): void {
    let message =
      'Не удалось выполнить операцию. Попробуйте ещё раз.';

    if (error instanceof Error) {
      message =
        error.message || message;
    }

    const generalError =
      this.root.querySelector<HTMLElement>(
        '#auth-general-error',
      );

    if (generalError) {
      generalError.textContent =
        this.normalizeErrorMessage(
          message,
        );
    }
  }

  private normalizeErrorMessage(
    message: string,
  ): string {
    const lower =
      message.toLowerCase();

    if (
      lower.includes('401') ||
      lower.includes('unauthorized') ||
      lower.includes('неверн')
    ) {
      return 'Неверный email или пароль.';
    }

    if (
      lower.includes('409') ||
      lower.includes('существ')
    ) {
      return 'Пользователь с таким email уже существует.';
    }

    if (
      lower.includes('network') ||
      lower.includes('fetch') ||
      lower.includes('failed to fetch')
    ) {
      return 'Проблема с соединением с сервером.';
    }

    if (
      lower.includes('400')
    ) {
      return 'Проверьте правильность введённых данных.';
    }

    return message;
  }

  private clearErrors(): void {
    const errors =
      this.root.querySelectorAll<HTMLElement>(
        '.form-error',
      );

    errors.forEach((error) => {
      error.textContent = '';
    });

    const inputs =
      this.root.querySelectorAll<HTMLInputElement>(
        '#auth-form input',
      );

    inputs.forEach((input) => {
      input.classList.remove(
        'input--error',
      );
    });
  }

  private clearInputError(
    inputId: string,
  ): void {
    const input =
      this.root.querySelector<HTMLInputElement>(
        `#${inputId}`,
      );

    input?.classList.remove(
      'input--error',
    );

    const errorId =
      `${inputId}-error`;

    const error =
      this.root.querySelector<HTMLElement>(
        `#${errorId}`,
      );

    error?.replaceChildren();
  }

  private markInputError(
    input: HTMLInputElement,
  ): void {
    input.classList.add(
      'input--error',
    );
  }

  private showError(
    id: string,
    message: string,
  ): void {
    const element =
      this.root.querySelector<HTMLElement>(
        `#${id}`,
      );

    if (element) {
      element.textContent = message;
    }
  }

  private isValidEmail(
    email: string,
  ): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email,
    );
  }

  private navigate(
    path: string,
  ): void {
    window.dispatchEvent(
      new CustomEvent('navigate', {
        detail: path,
      }),
    );
  }
}
