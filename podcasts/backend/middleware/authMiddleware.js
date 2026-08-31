const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../config/auth');

const authenticate = (
  req,
  res,
  next
) => {
  const authHeader =
    req.headers.authorization;

  console.log(
    'AUTH HEADER:',
    authHeader
  );

  if (!authHeader) {
    return res.status(401).json({
      message: 'Токен отсутствует',
    });
  }

  const parts =
    authHeader.split(' ');

  if (
    parts.length !== 2 ||
    parts[0] !== 'Bearer' ||
    !parts[1]
  ) {
    return res.status(401).json({
      message:
        'Неверный формат токена',
    });
  }

  const token = parts[1];

  try {
    const decoded =
      jwt.verify(
        token,
        JWT_SECRET
      );

    console.log(
      'DECODED TOKEN:',
      decoded
    );

    req.user = decoded;

    next();
  } catch (error) {
    console.error(
      'JWT ERROR:',
      error.message
    );

    return res.status(401).json({
      message:
        'Токен недействителен. Войдите заново.',
    });
  }
};

module.exports = authenticate;
