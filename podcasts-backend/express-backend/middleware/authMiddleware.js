const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET || 'audio-player-local-secret-key-v2';

const authenticate = (req, res, next) => {
  const header = req.headers.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());

  if (!match) {
    return res.status(401).json({ message: 'требуется авторизация' });
  }

  try {
    const decoded = jwt.verify(match[1].trim(), secretKey);
    if (!decoded || typeof decoded !== 'object' || typeof decoded.username !== 'string') {
      throw new Error('invalid payload');
    }
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: 'токен некорректный или истёк' });
  }
};

module.exports = { authenticate, secretKey };
