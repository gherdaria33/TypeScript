const express = require("express");
const authController = require("../controllers/authController");
const trackController = require("../controllers/trackController");
const authenticate = require("../middleware/auth");
const router = express.Router();
/*
 * Авторизация
 */
router.post(
  "/register",
  authController.register,
);
router.post(
  "/login",
  authController.login,
);
/*
 * Треки
 */
router.get(
  "/tracks",
  authenticate,
  trackController.getTracks,
);
/*
 * Избранное
 */
router.get(
  "/favorites",
  authenticate,
  trackController.getFavorites,
);
router.post(
  "/favorites",
  authenticate,
  trackController.addToFavorites,
);
router.delete(
  "/favorites",
  authenticate,
  trackController.removeFromFavorites,
);
module.exports = router;