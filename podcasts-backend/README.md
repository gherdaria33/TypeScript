# VibeCast Studio — финальная версия

## Запуск с нуля

### Backend

Остановите старый Node/Express сервер на порту 8000, затем:

```bash
cd express-backend
npm install
npm start
```

Проверка:

```text
http://localhost:8000/api/health
```

Должно вернуть:

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

Открыть адрес Vite, обычно `http://localhost:5173/`.

## Авторизация

Если аккаунт ещё не создан, на экране входа нажмите «Нет аккаунта? Зарегистрироваться».
После регистрации frontend автоматически выполняет вход и сохраняет новый JWT.

Пользователи сохраняются в `express-backend/data/users.json`, поэтому перезапуск backend
не удаляет аккаунты.

## Исправления этой версии

- единый JWT secret для выдачи и проверки токена;
- JWT живёт 24 часа;
- строгая обработка `Authorization: Bearer <token>`;
- старый/просроченный токен автоматически удаляется из localStorage;
- frontend возвращается на страницу авторизации при невалидном JWT;
- `/api/tracks` загружается независимо от `/api/favorites`, поэтому невалидный токен
  больше не скрывает весь список треков;
- `/api/health` для быстрой проверки backend;
- CORS/OPTIONS обработаны на backend;
- favorites сохраняются вместе с пользователем;
- `trackId` нормализуется в число;
- настоящие WAV-аудиоданные остаются в `data/tracks.js`;
- дизайн сохранён под присланный Figma desktop/mobile макет.
