const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { JWT_SECRET } = require('../config/auth');

const register = (req, res) => {
  try {
  const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: 'Введите логин и пароль',
      });
    }

  const existingUser = User.find(username);

  if (existingUser) {
      return res.status(400).json({
        message: 'пользователь уже существует',
      });
  }

    const hashedPassword = bcrypt.hashSync(
      password,
      10
    );

    const newUser = User.create(
      username,
      hashedPassword
    );

    return res.status(201).json({
      message: 'пользователь успешно добавлен',
      user: newUser,
    });
  } catch (error) {
    console.error(
      'REGISTER ERROR:',
      error
    );

    return res.status(500).json({
      message: 'Ошибка регистрации',
    });
  }
};

const login = (req, res) => {
  try {
  const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: 'Введите логин и пароль',
      });
    }

  const user = User.find(username);

    if (
      !user ||
      !bcrypt.compareSync(
        password,
        user.password
      )
    ) {
      return res.status(400).json({
        message:
          'произошла ошибка при авторизации - неверные данные',
      });
  }

    const token = jwt.sign(
      {
        username: user.username,
      },
      JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    console.log(
      'LOGIN:',
      user.username
    );

    console.log(
      'JWT CREATED'
    );

    return res.json({
      message:
        'авторизация прошла успешно',
      token,
    });
  } catch (error) {
    console.error(
      'LOGIN ERROR:',
      error
    );

    return res.status(500).json({
      message: 'Ошибка авторизации',
    });
  }
};

module.exports = {
  register,
  login,
};