const jwt = require('jsonwebtoken');

const JWT_SECRET = 'audio-player-secret-key';

function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      message: 'Требуется авторизация'
    });
  }

  const parts = authorization.split(' ');

  if (
    parts.length !== 2 ||
    parts[0] !== 'Bearer'
  ) {
    return res.status(401).json({
      message: 'Некорректный формат токена'
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({
      message: 'Недействительный токен'
    });
  }
}

module.exports = {
  authMiddleware,
  JWT_SECRET
};