# Audio Player — frontend согласованный с podcasts-backend

## Backend

Используется загруженный `express-backend`:

- `POST /api/register`
- `POST /api/login`
- `GET /api/tracks`
- `GET /api/favorites`
- `POST /api/favorites`
- `DELETE /api/favorites`

Frontend обращается к `/api`, а Vite проксирует запросы на `http://localhost:8000`.
Поэтому отдельная настройка CORS на backend не требуется.

## Запуск

### Backend

```bash
cd express-backend
npm install
npm start
```

### Frontend

```bash
cd audioplayer-frontend
npm install
npm run dev
```

Открыть:

`http://localhost:5173`

Проверка:

```bash
npm run typecheck
npm run build
```

## Важный момент про аудио

В предоставленном `data/tracks.js` поле `encoded_audio` действительно является Base64,
но его содержимое декодируется в обычный текст вида:

`Audio data for Eternal Sunset by Skyline Sounds`

Это НЕ MP3/WAV/OGG-аудиопоток. Поэтому браузер физически не сможет воспроизвести
эти демонстрационные строки как музыку.

Frontend уже умеет принимать настоящий `encoded_audio`, если backend начнёт отдавать:

- `data:audio/mpeg;base64,...`
- `data:audio/wav;base64,...`
- или Base64, который после декодирования является соответствующим audio data URL.

Остальной API полностью согласован с предоставленным backend, включая числовые `track.id`.
