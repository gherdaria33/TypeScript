# VibeCast Studio — final Audio Player

Финальная версия клиентской части собрана по присланному Figma-макету для desktop и mobile.

## Структура

- `express-backend` — Express API на `http://localhost:8000`
- `frontend` — TypeScript + Vite на `http://localhost:5173`

## Запуск backend

```bash
cd express-backend
npm install
npm start
```

## Запуск frontend

Во втором терминале:

```bash
cd frontend
npm install
npm run dev
```

Открыть адрес Vite, обычно `http://localhost:5173/`.

## Проверка

```bash
npm run typecheck
npm run build
```

## Реализовано

- авторизация и регистрация;
- JWT Bearer для защищённых запросов;
- список аудиокомпозиций;
- поиск;
- пагинация;
- избранное через API;
- профиль;
- Play/Pause;
- Previous/Next;
- -10/+10 секунд;
- перемотка по timeline;
- клавиатурные стрелки и Space;
- адаптивный mobile layout;
- desktop sidebar и header;
- mobile hamburger menu;
- локальные обложки, взятые из предоставленного пользователем референса для визуального соответствия макету;
- настоящие WAV-аудиоданные в `encoded_audio`.

## Mobile макет

На ширине до 700px интерфейс переключается на композицию из референса:

- тёмная верхняя панель `TypeScript`;
- hamburger слева;
- белая шапка VibeCast Studio + username;
- переключатели `Аудиокомпозиции` / `Избранное`;
- крупные карточки 96px с обложками;
- крупные сердечки и меню;
- компактный нижний player.
