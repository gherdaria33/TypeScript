# Express backend — Audio Player

## Запуск

```bash
npm install
npm start
```

Сервер: `http://localhost:8000`

Проверка: `http://localhost:8000/api/health`

## Важно

Пользователи и избранное сохраняются в `data/users.json`, поэтому перезапуск Node.js
не удаляет созданные аккаунты и избранные треки.

JWT использует единый секрет из `JWT_SECRET` или локальный секрет по умолчанию.
Срок действия токена — 24 часа.

`GET /api/tracks` является публичным, как указано в задании.
`/favorites` требует `Authorization: Bearer <token>`.
