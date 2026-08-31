# FINAL AUTH FIX

Backend: `http://localhost:8000`
Frontend: `http://localhost:5173`

## Backend
```bash
cd express-backend
npm install
npm start
```
Check: `http://localhost:8000/api/health` -> `{"ok":true}`

## Frontend
```bash
cd frontend
npm install
npm run dev
```

## Test account
Login: `demo`
Password: `demo1234`

Frontend now calls `http://localhost:8000/api` directly, so it does not depend on Vite proxy configuration. Backend has CORS enabled.
After successful login Local Storage receives `audio_player_token` and `audio_player_user`.
