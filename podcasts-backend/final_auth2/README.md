# VibeCast Studio — финальная версия

ВАЖНО: перед запуском остановите любой старый Node/Express сервер, который уже занимает порт 8000.

## Backend

```bash
cd express-backend
npm install
npm start
```

Проверка:

```text
http://localhost:8000/api/health
```

Ожидаемый ответ:

```json
{"ok":true}
```

## Frontend

Во втором терминале:

```bash
cd frontend
npm install
npm run dev
```

Открыть адрес Vite, обычно:

```text
http://localhost:5173/
```

## Авторизация

Новый чистый проект не содержит заранее созданного пользователя.
Нажмите «Нет аккаунта? Зарегистрироваться», создайте пользователя и затем войдите.

Пароль: минимум 4 символа.

JWT создаётся и проверяется одним и тем же ключом.
Старый токен из localStorage при невалидном ответе автоматически удаляется.

Пароли новых пользователей хранятся в хешированном виде через встроенный Node.js scrypt.
Старые bcrypt-хеши также поддерживаются, если установлен bcryptjs.

## API

- POST /api/register
- POST /api/login
- GET /api/tracks
- GET /api/favorites
- POST /api/favorites
- DELETE /api/favorites
- GET /api/health
