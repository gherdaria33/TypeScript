import { AuthService } from '../../services/authService';
import type { Router } from '../../router/Router';

type AuthMode =
  | 'login'
  | 'register';

export class AuthPage {
  private readonly root: HTMLElement;
  private readonly router: Router;
  private readonly mode: AuthMode;

  private readonly authService: AuthService;

  public constructor(
    root: HTMLElement,
    router: Router,
    mode: AuthMode = 'login',
  ) {
    this.root = root;
    this.router = router;
    this.mode = mode;

    this.authService =
      new AuthService();
  }

  public render(): void {
    const page =
      document.createElement('main');

    page.className =
      'auth-page';

    page.innerHTML = `
      <section class="auth">
        <div class="auth__logo">
          <div class="auth__logo-mark">
            ♪
          </div>

          <span>
            Audio
          </span>
        </div>

        <div class="auth__content">
          <p class="auth__subtitle">
            ${
              this.mode === 'login'
                ? 'Добро пожаловать'
                : 'Создайте аккаунт'
            }
          </p>

          <h1 class="auth__title">
            ${
              this.mode === 'login'
                ? 'Войти'
                : 'Регистрация'
            }
          </h1>

          <form
            class="auth-form"
            data-auth-form
          >
            <label class="auth-form__label">
              Имя пользователя

              <input
                class="auth-form__input"
                type="text"
                name="username"
                placeholder="Введите имя"
                autocomplete="username"
                minlength="3"
                required
              />
            </label>

            <label class="auth-form__label">
              Пароль

              <input
                class="auth-form__input"
                type="password"
                name="password"
                placeholder="Введите пароль"
                autocomplete="${
                  this.mode === 'login'
                    ? 'current-password'
                    : 'new-password'
                }"
                minlength="4"
                required
              />
            </label>

            ${
              this.mode === 'register'
                ? `
                  <label class="auth-form__label">
                    Повторите пароль

                    <input
                      class="auth-form__input"
                      type="password"
                      name="confirmPassword"
                      placeholder="Повторите пароль"
                      autocomplete="new-password"
                      minlength="4"
                      required
                    />
                  </label>
                `
                : ''
            }

            <p
              class="auth-form__error"
              data-auth-error
              aria-live="polite"
            ></p>

            <button
              class="auth-form__submit"
              type="submit"
            >
              ${
                this.mode === 'login'
                  ? 'Войти'
                  : 'Зарегистрироваться'
              }
            </button>
          </form>

          <button
            class="auth__switch"
            type="button"
            data-switch
          >
            ${
              this.mode === 'login'
                ? 'Нет аккаунта? Зарегистрироваться'
                : 'Уже есть аккаунт? Войти'
            }
          </button>
        </div>
      </section>
    `;

    this.root.append(
      page,
    );

    this.bindEvents(
      page,
    );
  }

  private bindEvents(
    page: HTMLElement,
  ): void {
    const form =
      page.querySelector<HTMLFormElement>(
        '[data-auth-form]',
      );

    const switchButton =
      page.querySelector<HTMLButtonElement>(
        '[data-switch]',
      );

    form?.addEventListener(
      'submit',
      (event) => {
        event.preventDefault();

        void this.handleSubmit(
          form,
          page,
        );
      },
    );

    switchButton?.addEventListener(
      'click',
      () => {
        if (
          this.mode === 'login'
        ) {
          this.router.navigate(
            '/register',
          );
        } else {
          this.router.navigate(
            '/login',
          );
        }
      },
    );
  }

  private async handleSubmit(
    form: HTMLFormElement,
    page: HTMLElement,
  ): Promise<void> {
    const formData =
      new FormData(form);

    const username =
      String(
        formData.get(
          'username',
        ) ?? '',
      ).trim();

    const password =
      String(
        formData.get(
          'password',
        ) ?? '',
      );

    const confirmPassword =
      String(
        formData.get(
          'confirmPassword',
        ) ?? '',
      );

    const errorElement =
      page.querySelector<HTMLElement>(
        '[data-auth-error]',
      );

    const submitButton =
      form.querySelector<HTMLButtonElement>(
        '[type="submit"]',
      );

    if (
      username.length < 3
    ) {
      this.showError(
        errorElement,
        'Имя пользователя должно содержать минимум 3 символа.',
      );

      return;
    }

    if (
      password.length < 4
    ) {
      this.showError(
        errorElement,
        'Пароль должен содержать минимум 4 символа.',
      );

      return;
    }

    if (
      this.mode === 'register' &&
      password !== confirmPassword
    ) {
      this.showError(
        errorElement,
        'Пароли не совпадают.',
      );

      return;
    }

    this.setLoading(
      submitButton,
      true,
    );

    this.clearError(
      errorElement,
    );

    try {
      if (
        this.mode === 'register'
      ) {
        await this.authService.register(
          username,
          password,
        );

        await this.authService.login(
          username,
          password,
        );
      } else {
        await this.authService.login(
          username,
          password,
        );
      }

      this.router.navigate(
        '/',
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Произошла ошибка. Попробуйте ещё раз.';

      this.showError(
        errorElement,
        message,
      );
    } finally {
      this.setLoading(
        submitButton,
        false,
      );
    }
  }

  private showError(
    element: HTMLElement | null,
    message: string,
  ): void {
    if (!element) {
      return;
    }

    element.textContent =
      message;
  }

  private clearError(
    element: HTMLElement | null,
  ): void {
    if (!element) {
      return;
    }

    element.textContent =
      '';
  }

  private setLoading(
    button: HTMLButtonElement | null,
    loading: boolean,
  ): void {
    if (!button) {
      return;
    }

    button.disabled =
      loading;

    button.textContent =
      loading
        ? 'Загрузка...'
        : this.mode === 'login'
          ? 'Войти'
          : 'Зарегистрироваться';
  }
}
