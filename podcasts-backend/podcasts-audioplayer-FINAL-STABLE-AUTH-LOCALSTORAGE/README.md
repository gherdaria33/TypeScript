# Audio Player — AUTH FIX

## Быстрая проверка

После запуска backend можно сразу войти тестовым аккаунтом:

- username: `demo`
- password: `demo1234`

После успешного входа в браузере должны появиться:

- `audio_player_token`
- `audio_player_user`

в Local Storage именно того origin, с которого открыт frontend.

## Запуск

Backend:
```bash
cd express-backend
npm install
npm start
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Открывай именно адрес Vite, например `http://localhost:5173/`.
Не смешивай `localhost:5173` и `127.0.0.1:5173`, поскольку у них разный Local Storage.

## Если Local Storage пустой

1. Открой DevTools на странице `http://localhost:5173/`.
2. Application → Local Storage → `http://localhost:5173`.
3. Войди через `demo / demo1234`.
4. После успешного ответа `/api/login` ключи должны появиться автоматически.

В новой версии frontend проверяет факт записи токена и показывает ошибку на странице, если браузер блокирует Local Storage.
