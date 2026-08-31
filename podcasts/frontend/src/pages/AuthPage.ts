import { el } from 'redom';
import { authService } from '../services/authService';

export class AuthPage {
  public readonly el: HTMLElement;
  private mode: 'login' | 'register' = 'login';

  constructor(onSuccess: () => void) {
    const title = el('h1.auth__title', 'С возвращением');
    const subtitle = el('p.auth__subtitle', 'Войдите, чтобы слушать музыку и сохранять любимые треки.');
    const form = el('form.auth__form') as HTMLFormElement;
    const username = el('input.auth__input', {
      type: 'text', placeholder: 'Имя пользователя', required: true, autocomplete: 'username'
    }) as HTMLInputElement;
    const password = el('input.auth__input', {
      type: 'password', placeholder: 'Пароль', required: true, autocomplete: 'current-password'
    }) as HTMLInputElement;
    const submit = el('button.auth__submit', { type: 'submit' }, 'Войти') as HTMLButtonElement;
    const error = el('div.auth__error') as HTMLElement;
    error.setAttribute('role', 'alert');
    const switcher = el('button.auth__switch', {
      type: 'button',
      onclick: () => {
        this.mode = this.mode === 'login' ? 'register' : 'login';
        title.textContent = this.mode === 'login' ? 'С возвращением' : 'Создайте аккаунт';
        subtitle.textContent = this.mode === 'login'
          ? 'Войдите, чтобы слушать музыку и сохранять любимые треки.'
          : 'Зарегистрируйтесь, чтобы создать свою музыкальную коллекцию.';
        submit.textContent = this.mode === 'login' ? 'Войти' : 'Зарегистрироваться';
        switcher.textContent = this.mode === 'login'
          ? 'Нет аккаунта? Зарегистрироваться'
          : 'Уже есть аккаунт? Войти';
        password.autocomplete = this.mode === 'login' ? 'current-password' : 'new-password';
        error.textContent = '';
      }
    }, 'Нет аккаунта? Зарегистрироваться') as HTMLButtonElement;

    form.append(username, password, submit, error, switcher);
    form.addEventListener('submit', async (event: SubmitEvent) => {
      event.preventDefault();
      error.textContent = '';
      submit.disabled = true;
      submit.textContent = this.mode === 'login' ? 'Входим…' : 'Создаём…';
      try {
        const name = username.value.trim();
        if (name.length < 2) throw new Error('Имя пользователя должно содержать минимум 2 символа');
        if (password.value.length < 4) throw new Error('Пароль должен содержать минимум 4 символа');

        if (this.mode === 'login') {
          await authService.login(name, password.value);
          onSuccess();
        } else {
          await authService.register(username.value.trim(), password.value);
          await authService.login(name, password.value);
          onSuccess();
        }
      } catch (err) {
        error.textContent = err instanceof Error ? err.message : 'Произошла ошибка';
      } finally {
        submit.disabled = false;
        submit.textContent = this.mode === 'login' ? 'Войти' : 'Зарегистрироваться';
      }
    });

    this.el = el('main.auth', [
      el('section.auth__card', [
        el('div.auth__logo', '♫'),
        title,
        subtitle,
        form
      ])
    ]) as HTMLElement;
  }
}