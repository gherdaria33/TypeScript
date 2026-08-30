# Podcasts Audio Player — Final Project

Полный проект:
- `express-backend/` — Express API
- `frontend/` — TypeScript + Vite клиент

## 1. Запуск backend

```bash
cd express-backend
npm install
npm start
```

Backend:
`http://localhost:8000`

API:
`http://localhost:8000/api`

## 2. Запуск frontend

В другом терминале:

```bash
cd frontend
npm install
npm run dev
```

Frontend:
`http://localhost:5173`

Vite проксирует `/api` на `http://localhost:8000`.

## 3. Проверка frontend

```bash
npm run typecheck
npm run build
```

## 4. Аудио

Backend содержит реальные тестовые WAV-аудиоданные в `encoded_audio`
в формате `data:audio/wav;base64,...`.

Это позволяет браузерному HTMLAudioElement действительно воспроизводить
тестовые треки.

## 5. API

- POST `/api/register`
- POST `/api/login`
- GET `/api/tracks`
- GET `/api/favorites`
- POST `/api/favorites`
- DELETE `/api/favorites`

Для защищённых запросов используется:

`Authorization: Bearer <token>`
