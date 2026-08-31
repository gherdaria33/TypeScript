# Audio Player — стабильная финальная версия

## Запуск

### Backend

```bash
cd express-backend
npm install
npm start
```

После запуска в терминале должны появиться:

```text
Audio Player backend: http://localhost:8000
API: http://localhost:8000/api
Health: http://localhost:8000/api/health
```

Проверь в браузере:

`http://localhost:8000/api/health`

Ответ:

```json
{"ok":true}
```

### Frontend

Во втором терминале:

```bash
cd frontend
npm install
npm run dev
```

Открой адрес Vite, обычно `http://localhost:5173/`.

## Первый вход

В новой версии `users.json` пустой. Нажми «Нет аккаунта? Зарегистрироваться», создай пользователя (минимум 2 символа имени и 4 символа пароля), затем войди.

## Важно

Если на `8000` уже работает старый Node/Express сервер, останови его `Ctrl+C` перед запуском этой версии. Иначе браузер будет обращаться к старому API и можно получить «токен некорректный».

Список треков `/api/tracks` загружается независимо от `/api/favorites`, поэтому ошибка сессии не скрывает каталог.
