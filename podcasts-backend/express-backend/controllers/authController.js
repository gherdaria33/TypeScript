const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { secretKey } = require('../middleware/authMiddleware');

const register = (req, res) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (username.length < 2 || password.length < 4) {
    return res.status(400).json({ message: 'Имя пользователя и пароль заполнены некорректно' });
  }

  if (User.find(username)) {
    return res.status(400).json({ message: 'пользователь уже существует' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = User.create(username, hashedPassword);

  return res.status(201).json({ message: 'пользователь успешно добавлен', user: newUser });
};

const login = (req, res) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const user = User.find(username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ message: 'произошла ошибка при авторизации - неверные данные' });
  }

  const token = jwt.sign({ username }, secretKey, { expiresIn: '24h' });
  return res.json({ message: 'авторизация прошла успешно', token, user: { username } });
};

module.exports = { register, login };
