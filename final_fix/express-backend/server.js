const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');

const app = express();
const PORT = Number(process.env.PORT) || 8000;

// Development-only demo account: demo / demo1234.
// It makes the project immediately testable after a clean install.
try {
  const User = require('./models/User');
  if (!User.find('demo')) {
    const crypto = require('crypto');
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync('demo1234', salt, 64).toString('hex');
    User.create('demo', `scrypt:${salt}:${hash}`);
  }
} catch (error) {
  console.error('Unable to initialize demo user:', error);
}

app.use(bodyParser.json({ limit: '20mb' }));
app.use((req, _res, next) => { console.log(`[API] ${req.method} ${req.path}`); next(); });
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', routes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Маршрут не найден' });
});

app.use((err, _req, res, _next) => {
  console.error('Backend error:', err);
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

app.listen(PORT, () => {
  console.log('========================================');
  console.log(`Audio Player backend: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log('========================================');
});
