const jwt = require("jsonwebtoken");

const secretKey = "your_secret_key";

const authenticate = (req, res, next) => {
  const authorization =
    req.headers.authorization;

  if (!authorization) {
    return res.status(403).json({
      message: "доступ запрещен",
    });
  }

  const parts =
    authorization.split(" ");

  if (
    parts.length !== 2 ||
    parts[0] !== "Bearer"
  ) {
    return res.status(400).json({
      message: "токен некорректный",
    });
  }

  const token = parts[1];

  try {
    const decoded =
      jwt.verify(token, secretKey);

    req.user = decoded;

    next();
  } catch {
    return res.status(400).json({
      message: "токен некорректный",
    });
  }
};

module.exports = authenticate;