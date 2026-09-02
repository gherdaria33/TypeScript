# Audio Player — финальная версия

Проект состоит из двух частей:

- `backend` — API с JWT, избранным и реальными тестовыми WAV-аудиоданными;
- `frontend` — TypeScript + Vite + Redom, сверстанный в стиле предоставленного макета: левый sidebar, верхняя панель пользователя, список композиций, избранное, профиль и фиксированный нижний плеер.

## Запуск backend

```bash
cd backend
npm install
npm start
```

Backend: http://localhost:8000

## Запуск frontend

Во втором терминале:

```bash
cd frontend
npm install
npm run dev
```

Открыть адрес, который покажет Vite, обычно `http://localhost:5173/`.

## Проверка

```bash
npm run typecheck
npm run build
```

Frontend использует Vite proxy `/api -> http://localhost:8000`, поэтому браузеру не требуется отдельная CORS-настройка.

## Функциональность

Авторизация, регистрация, список треков, поиск, пагинация, избранное, профиль, play/pause, previous/next, ±10 секунд, перемотка по шкале и управление клавиатурой.
