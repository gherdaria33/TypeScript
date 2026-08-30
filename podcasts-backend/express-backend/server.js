const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const {
  authMiddleware,
  JWT_SECRET
} = require('./middleware/auth');

const app = express();

const PORT = 8000;

const DATA_DIR = path.join(
  __dirname,
  'data'
);

const PUBLIC_DIR = path.join(
  __dirname,
  'public'
);

const USERS_FILE = path.join(
  DATA_DIR,
  'users.json'
);

const TRACKS_FILE = path.join(
  DATA_DIR,
  'tracks.json'
);

const FAVORITES_FILE = path.join(
  DATA_DIR,
  'favorites.json'
);

function ensureFile(
  filePath,
  defaultValue
) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(
      filePath,
      JSON.stringify(
        defaultValue,
        null,
        2
      ),
      'utf8'
    );
  }
}

function readJson(filePath) {
  try {
    const content =
      fs.readFileSync(
        filePath,
        'utf8'
      );

    return JSON.parse(content);
  } catch {
    return [];
  }
}

function writeJson(
  filePath,
  data
) {
  fs.writeFileSync(
    filePath,
    JSON.stringify(
      data,
      null,
      2
    ),
    'utf8'
  );
}

ensureFile(
  USERS_FILE,
  []
);

ensureFile(
  FAVORITES_FILE,
  []
);

ensureFile(
  TRACKS_FILE,
  []
);

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ],
    methods: [
      'GET',
      'POST',
      'DELETE',
      'OPTIONS'
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization'
    ]
  })
);

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(
  express.static(PUBLIC_DIR)
);

app.get(
  '/',
  (req, res) => {
    res.json({
      message:
        'Audio Player API работает'
    });
  }
);

app.get(
  '/api/ping',
  (req, res) => {
    res.json({
      message: 'pong'
    });
  }
);

app.post(
  '/api/register',
  async (req, res) => {
    const {
      username,
      password
    } = req.body;

    if (
      typeof username !== 'string' ||
      typeof password !== 'string'
    ) {
      return res.status(400).json({
        message:
          'Имя пользователя и пароль обязательны'
      });
    }

    const cleanUsername =
      username.trim();

    if (cleanUsername.length < 3) {
      return res.status(400).json({
        message:
          'Имя пользователя должно содержать минимум 3 символа'
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        message:
          'Пароль должен содержать минимум 4 символа'
      });
    }

    const users =
      readJson(USERS_FILE);

    const existingUser =
      users.find(
        (user) =>
          user.username.toLowerCase() ===
          cleanUsername.toLowerCase()
      );

    if (existingUser) {
      return res.status(409).json({
        message:
          'пользователь уже существует'
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const newUser = {
      id: String(
        Date.now()
      ),
      username: cleanUsername,
      password: hashedPassword
    };

    users.push(newUser);

    writeJson(
      USERS_FILE,
      users
    );

    return res.status(201).json({
      message:
        'пользователь успешно добавлен',
      user: {
        username: cleanUsername
      }
    });
  }
);

app.post(
  '/api/login',
  async (req, res) => {
    const {
      username,
      password
    } = req.body;

    if (
      typeof username !== 'string' ||
      typeof password !== 'string'
    ) {
      return res.status(400).json({
        message:
          'Введите имя пользователя и пароль'
      });
    }

    const users =
      readJson(USERS_FILE);

    const user =
      users.find(
        (item) =>
          item.username.toLowerCase() ===
          username.trim().toLowerCase()
      );

    if (!user) {
      return res.status(401).json({
        message:
          'произошла ошибка при авторизации — неверные данные'
      });
    }

    const passwordIsCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordIsCorrect) {
      return res.status(401).json({
        message:
          'произошла ошибка при авторизации — неверные данные'
      });
    }

    const token =
      jwt.sign(
        {
          id: user.id,
          username: user.username
        },
        JWT_SECRET,
        {
          expiresIn: '7d'
        }
      );

    return res.json({
      message:
        'авторизация прошла успешно',
      token
    });
  }
);

app.get(
  '/api/tracks',
  authMiddleware,
  (req, res) => {
    const tracks =
      readJson(TRACKS_FILE);

    return res.json(tracks);
  }
);

app.get(
  '/api/favorites',
  authMiddleware,
  (req, res) => {
    const favorites =
      readJson(FAVORITES_FILE);

    const tracks =
      readJson(TRACKS_FILE);

    const userFavorites =
      favorites.filter(
        (favorite) =>
          favorite.userId ===
          req.user.id
      );

    const result =
      userFavorites
        .map(
          (favorite) =>
            tracks.find(
              (track) =>
                track.id ===
                favorite.trackId
            )
        )
        .filter(Boolean);

    return res.json(result);
  }
);

app.post(
  '/api/favorites',
  authMiddleware,
  (req, res) => {
    const {
      trackId
    } = req.body;

    if (
      typeof trackId !== 'string'
    ) {
      return res.status(400).json({
        message:
          'trackId обязателен'
      });
    }

    const tracks =
      readJson(TRACKS_FILE);

    const track =
      tracks.find(
        (item) =>
          item.id === trackId
      );

    if (!track) {
      return res.status(404).json({
        message:
          'Трек не найден'
      });
    }

    const favorites =
      readJson(FAVORITES_FILE);

    const alreadyFavorite =
      favorites.some(
        (favorite) =>
          favorite.userId ===
            req.user.id &&
          favorite.trackId ===
            trackId
      );

    if (alreadyFavorite) {
      return res.status(409).json({
        message:
          'Композиция уже находится в избранном'
      });
    }

    favorites.push({
      userId: req.user.id,
      trackId
    });

    writeJson(
      FAVORITES_FILE,
      favorites
    );

    return res.status(201).json({
      message:
        'композиция добавлена в избранное'
    });
  }
);

app.delete(
  '/api/favorites',
  authMiddleware,
  (req, res) => {
    const {
      trackId
    } = req.body;

    if (
      typeof trackId !== 'string'
    ) {
      return res.status(400).json({
        message:
          'trackId обязателен'
      });
    }

    const favorites =
      readJson(FAVORITES_FILE);

    const newFavorites =
      favorites.filter(
        (favorite) =>
          !(
            favorite.userId ===
              req.user.id &&
            favorite.trackId ===
              trackId
          )
      );

    if (
      newFavorites.length ===
      favorites.length
    ) {
      return res.status(404).json({
        message:
          'Композиция не найдена в избранном'
      });
    }

    writeJson(
      FAVORITES_FILE,
      newFavorites
    );

    return res.json({
      message:
        'композиция убрана из избранного'
    });
  }
);

app.get(
  '/api/profile',
  authMiddleware,
  (req, res) => {
    return res.json({
      user: {
        id: req.user.id,
        username:
          req.user.username
      }
    });
  }
);

app.use(
  (req, res) => {
    res.status(404).json({
      message:
        'Маршрут не найден'
    });
  }
);

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(error);

    res.status(500).json({
      message:
        'Внутренняя ошибка сервера'
    });
  }
);

app.listen(
  PORT,
  () => {
    console.log('');
    console.log(
      '🎵 Audio Player Backend'
    );
    console.log(
      `🚀 Сервер запущен: http://localhost:${PORT}`
    );
    console.log(
      `🔌 API: http://localhost:${PORT}/api`
    );
    console.log('');
  }
);