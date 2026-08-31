const jwt = require("jsonwebtoken");

const SECRET_KEY = "your_secret_key";

const authenticate = (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization;

    console.log(
      "AUTH HEADER:",
      authHeader
    );

    if (!authHeader) {
      return res.status(401).json({
        message: "Токен отсутствует",
      });
    }

    const parts =
      authHeader.split(" ");

    if (
      parts.length !== 2 ||
      parts[0] !== "Bearer" ||
      !parts[1]
    ) {
      return res.status(401).json({
        message: "Неверный формат токена",
      });
    }

    const token = parts[1];

    const decoded =
      jwt.verify(
        token,
        SECRET_KEY
      );

    console.log(
      "DECODED TOKEN:",
      decoded
    );

    if (
      !decoded ||
      typeof decoded !== "object" ||
      !decoded.username
    ) {
      return res.status(401).json({
        message: "Токен не содержит пользователя",
      });
    }

    req.user = decoded;

    next();

  } catch (error) {

    console.error(
      "JWT ERROR:",
      error.message
    );

    return res.status(401).json({
      message: "токен некорректный",
    });
  }
};

module.exports =
  authenticate;