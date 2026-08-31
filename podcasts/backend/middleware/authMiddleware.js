const jwt = require("jsonwebtoken");

const secretKey = "your_secret_key";

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("AUTH HEADER:", authHeader);

  if (!authHeader) {
    return res.status(401).json({
      message: "Токен отсутствует",
    });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({
      message: "Неверный формат токена",
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, secretKey);

    console.log("DECODED TOKEN:", decoded);

    req.user = decoded;

    next();
  } catch (error) {
    console.error("JWT ERROR:", error.message);

    return res.status(401).json({
      message: "токен некорректный",
    });
  }
};

module.exports = authenticate;