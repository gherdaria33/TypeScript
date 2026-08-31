const { tracks } = require("../data/tracks");
const User = require("../models/User");
const getTracks = (req, res) => {
  res.json(tracks);
};
const addToFavorites = (req, res) => {
  try {
    const trackId = Number(req.body.trackId);
    const username = req.user.username;
    console.log("ADD FAVORITE");
    console.log("username:", username);
    console.log("trackId:", trackId);
    if (!Number.isFinite(trackId)) {
      return res.status(400).json({
        message: "Некорректный trackId",
      });
    }
    const trackExists = tracks.some(
      (track) => Number(track.id) === trackId
    );
    if (!trackExists) {
      return res.status(404).json({
        message: "Трек не найден",
      });
    }
    User.addFavorite(username, trackId);
    console.log(
      "FAVORITES:",
      User.getFavorites(username)
    );
    return res.json({
      message: "Композиция добавлена в избранное",
    });
  } catch (error) {
    console.error("ADD FAVORITE ERROR:", error);
    return res.status(500).json({
      message: "Ошибка добавления в избранное",
    });
  }
};
const removeFromFavorites = (req, res) => {
  try {
    const trackId = Number(req.body.trackId);
    const username = req.user.username;
    console.log("REMOVE FAVORITE");
    console.log("username:", username);
    console.log("trackId:", trackId);
    User.removeFavorite(username, trackId);
    return res.json({
      message: "Композиция убрана из избранного",
    });
  } catch (error) {
    console.error("REMOVE FAVORITE ERROR:", error);
    return res.status(500).json({
      message: "Ошибка удаления из избранного",
    });
  }
};
const getFavorites = (req, res) => {
  try {
    const username = req.user.username;
    const favoriteTracks =
      User.getFavorites(username);
    console.log(
      "GET FAVORITES:",
      username,
      favoriteTracks
    );
    const favoriteTrackDetails = tracks.filter(
      (track) =>
        favoriteTracks.includes(Number(track.id))
    );
    return res.json(favoriteTrackDetails);
  } catch (error) {
    console.error("GET FAVORITES ERROR:", error);
    return res.status(500).json({
      message: "Ошибка получения избранного",
    });
  }
};
module.exports = {
  getTracks,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
};