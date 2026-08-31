const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const SECRET_KEY = "your_secret_key";


// ==========================================
// REGISTER
// ==========================================

const register = (req, res) => {
  try {
    const {
      username,
      password,
    } = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message:
          "Введите имя пользователя и пароль",
      });
    }

    const cleanUsername =
      username.trim();

    if (!cleanUsername) {
      return res.status(400).json({
        message:
          "Имя пользователя не может быть пустым",
      });
    }

    if (!password) {
      return res.status(400).json({
        message:
          "Пароль не может быть пустым",
      });
    }

    const existingUser =
      User.find(cleanUsername);

    if (existingUser) {
      return res.status(400).json({
        message:
          "пользователь уже существует",
      });
    }

    const hashedPassword =
      bcrypt.hashSync(
        password,
        10
      );

    const newUser =
      User.create(
        cleanUsername,
        hashedPassword
      );

    return res.status(201).json({
      message:
        "пользователь успешно добавлен",

      user: newUser,
    });

  } catch (error) {

    console.error(
      "REGISTER ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Ошибка регистрации",
    });
  }
};


// ==========================================
// LOGIN
// ==========================================

const login = (req, res) => {
  try {
    const {
      username,
      password,
    } = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message:
          "Введите имя пользователя и пароль",
      });
    }

    const cleanUsername =
      username.trim();

    const user =
      User.find(cleanUsername);

    if (
      !user ||
      !bcrypt.compareSync(
        password,
        user.password
      )
    ) {
      return res.status(400).json({
        message:
          "произошла ошибка при авторизации - неверные данные",
      });
    }

    // ВАЖНО:
    // username записываем внутрь JWT.
    // Именно его потом использует
    // authMiddleware и favorites.
    const token =
      jwt.sign(
        {
          username: cleanUsername,
        },
        SECRET_KEY,
        {
          expiresIn: "7d",
        }
      );

    console.log(
      "LOGIN USER:",
      cleanUsername
    );

    console.log(
      "JWT CREATED"
    );

    return res.json({
      message:
        "авторизация прошла успешно",

      token,

      user: {
        username: cleanUsername,
      },
    });

  } catch (error) {

    console.error(
      "LOGIN ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Ошибка авторизации",
    });
  }
};


module.exports = {
  register,
  login,
};