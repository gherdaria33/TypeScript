const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'users.json');

function ensureFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

function readUsers() {
  ensureFile();
  try {
    const value = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  ensureFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
}

const User = {
  create: (username, passwordHash) => {
    const users = readUsers();
    const user = { username, password: passwordHash, favorites: [] };
    users.push(user);
    writeUsers(users);
    return { username };
  },

  find: (username) => {
    const users = readUsers();
    const normalized = String(username).trim().toLowerCase();
    return users.find((user) => String(user.username).trim().toLowerCase() === normalized);
  },

  addFavorite: (username, trackId) => {
    const users = readUsers();
    const user = users.find((item) => item.username === username);
    if (!user) return;
    if (!Array.isArray(user.favorites)) user.favorites = [];
    const normalizedId = Number(trackId);
    if (Number.isFinite(normalizedId) && !user.favorites.includes(normalizedId)) {
      user.favorites.push(normalizedId);
      writeUsers(users);
    }
  },

  removeFavorite: (username, trackId) => {
    const users = readUsers();
    const user = users.find((item) => item.username === username);
    if (!user || !Array.isArray(user.favorites)) return;
    const normalizedId = Number(trackId);
    user.favorites = user.favorites.filter((id) => Number(id) !== normalizedId);
    writeUsers(users);
  },

  getFavorites: (username) => {
    const user = User.find(username);
    return user && Array.isArray(user.favorites) ? user.favorites.map(Number) : [];
  },
};

module.exports = User;
