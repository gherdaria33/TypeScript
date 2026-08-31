const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET || 'audio-player-local-secret-key';

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'требуется авторизация' });
  }

  const token = header.slice(7).trim();

  if (!token) {
    return res.status(401).json({ message: 'требуется авторизация' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'токен некорректный или истёк' });
  }
};

module.exports = { authenticate, secretKey };
