const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { secretKey } = require('../middleware/authMiddleware');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false;

  // Current format: Node's built-in scrypt.
  if (stored.startsWith('scrypt:')) {
    const [, salt, expected] = stored.split(':');
    if (!salt || !expected) return false;
    const actual = crypto.scryptSync(password, salt, 64).toString('hex');
    const a = Buffer.from(actual, 'hex');
    const b = Buffer.from(expected, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }

  // Backward compatibility with older bcryptjs users, if bcryptjs is installed.
  if (stored.startsWith('$2')) {
    try {
      const bcrypt = require('bcryptjs');
      return bcrypt.compareSync(password, stored);
    } catch {
      return false;
    }
  }

  return false;
}

const register = (req, res) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (username.length < 2 || password.length < 4) {
    return res.status(400).json({ message: 'Имя пользователя — минимум 2 символа, пароль — минимум 4 символа' });
  }

  if (User.find(username)) {
    return res.status(400).json({ message: 'пользователь уже существует' });
  }

  const newUser = User.create(username, hashPassword(password));
  return res.status(201).json({ message: 'пользователь успешно добавлен', user: newUser });
};

const login = (req, res) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const user = User.find(username);

  if (!username || !password || !user || !verifyPassword(password, user.password)) {
    return res.status(400).json({ message: 'произошла ошибка при авторизации — неверные данные' });
  }

  const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: '24h' });
  return res.json({ message: 'авторизация прошла успешно', token, user: { username: user.username } });
};

module.exports = { register, login };
