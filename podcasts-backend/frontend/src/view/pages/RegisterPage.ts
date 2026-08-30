import { el, setChildren } from 'redom';

import type { Router } from '../../Router';
import { authService } from '../../services/authService';

export class RegisterPage {
  private readonly router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  render(): HTMLElement {
    const page = el('main.auth-page');

    const card = el('section.auth-card');

    const logo = el(
      'div.auth-logo',
      'vibecast audio'
    );

    const title = el(
      'h1.auth-title',
      'Регистрация'
    );

    const subtitle = el(
      'p.auth-subtitle',
      'Создайте новый аккаунт'
    );

    const form = el('form.auth-form');

    const usernameLabel = el(
      'label.auth-label',
      'Имя пользователя'
    );

    const usernameInput = el(
      'input.auth-input'
    ) as HTMLInputElement;

    usernameInput.type = 'text';
    usernameInput.placeholder = 'Введите имя пользователя';
    usernameInput.autocomplete = 'username';
    usernameInput.required = true;
    usernameInput.minLength = 3;

    const passwordLabel = el(
      'label.auth-label',
      'Пароль'
    );

    const passwordInput = el(
      'input.auth-input'
    ) as HTMLInputElement;

    passwordInput.type = 'password';
    passwordInput.placeholder = 'Введите пароль';
    passwordInput.autocomplete = 'new-password';
    passwordInput.required = true;
    passwordInput.minLength = 4;

    const repeatPasswordLabel = el(
      'label.auth-label',
      'Повторите пароль'
    );

    const repeatPasswordInput = el(
      'input.auth-input'
    ) as HTMLInputElement;

    repeatPasswordInput.type = 'password';
    repeatPasswordInput.placeholder = 'Повторите пароль';
    repeatPasswordInput.autocomplete = 'new-password';
    repeatPasswordInput.required = true;

    const message = el(
      'p.auth-message'
    );

    message.hidden = true;

    const submitButton = el(
      'button.auth-submit',
      'Создать аккаунт'
    ) as HTMLButtonElement;

    submitButton.type = 'submit';

    const loginText = el(
      'p.auth-switch'
    );

    const loginButton = el(
      'button.auth-link',
      'Войти'
    ) as HTMLButtonElement;

    loginButton.type = 'button';

    loginButton.addEventListener('click', () => {
      this.router.navigate('/login');
    });

    setChildren(
      loginText,
      'Уже есть аккаунт? ',
      loginButton
    );

    setChildren(
      usernameLabel,
      usernameInput
    );

    setChildren(
      passwordLabel,
      passwordInput
    );

    setChildren(
      repeatPasswordLabel,
      repeatPasswordInput
    );

    setChildren(
      form,
      usernameLabel,
      passwordLabel,
      repeatPasswordLabel,
      message,
      submitButton
    );

    form.addEventListener(
      'submit',
      async (event: SubmitEvent) => {
        event.preventDefault();

        message.hidden = true;

        if (
          passwordInput.value !==
          repeatPasswordInput.value
        ) {
          message.hidden = false;
          message.textContent =
            'Пароли не совпадают';
          return;
        }

        submitButton.disabled = true;
        submitButton.textContent =
          'Регистрация...';

        try {
          await authService.register(
            usernameInput.value,
            passwordInput.value
          );

          message.hidden = false;
          message.textContent =
            'Регистрация успешна. Теперь войдите.';

          form.reset();

          window.setTimeout(() => {
            this.router.navigate('/login');
          }, 1000);
        } catch (requestError: unknown) {
          message.hidden = false;

          if (requestError instanceof Error) {
            message.textContent =
              requestError.message;
          } else {
            message.textContent =
              'Не удалось зарегистрироваться';
          }
        } finally {
          submitButton.disabled = false;
          submitButton.textContent =
            'Создать аккаунт';
        }
      }
    );

    setChildren(
      card,
      logo,
      title,
      subtitle,
      form,
      loginText
    );

    setChildren(page, card);

    return page;
  }
}