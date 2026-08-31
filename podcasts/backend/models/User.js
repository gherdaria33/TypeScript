const users = [];
const favorites = {};

const User = {
  create: (username, password) => {
    const user = { username, password };

    users.push(user);

    favorites[username] = [];

    return user;
  },

  find: (username) => {
    return users.find(
      (user) => user.username === username
    );
  },

  addFavorite: (username, trackId) => {
    const id = Number(trackId);

    if (!favorites[username]) {
      favorites[username] = [];
    }

    if (!favorites[username].includes(id)) {
      favorites[username].push(id);
    }
  },

  removeFavorite: (username, trackId) => {
    if (!favorites[username]) {
      return;
    }

    const id = Number(trackId);

    const index =
      favorites[username].indexOf(id);

    if (index !== -1) {
      favorites[username].splice(index, 1);
    }
  },

  getFavorites: (username) => {
    return favorites[username] || [];
  },
};

module.exports = User;