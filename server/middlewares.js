const jwt = require("jsonwebtoken");
const config = require("./configs");
const express = require("express");
const path = require("path");
const Users = require("./models/users");
exports.checkAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication token missing" });
    }

    const auth = token?.replace("Bearer ", "");

    const decoded = jwt.verify(auth, config?.jwtSecret);

    if (decoded.exp <= Date.now() / 1000) {
      return res
        .status(401)
        .json({ success: false, message: "Token has expired" });
    }
    const user = await Users.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid Token" });
    }
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Authentication failed" });
  }
};
exports.checkAdminAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication token missing" });
    }

    const auth = token?.replace("Bearer ", "");

    const decoded = jwt.verify(auth, config?.jwtSecret);

    if (decoded.exp <= Date.now() / 1000) {
      return res
        .status(401)
        .json({ success: false, message: "Token has expired" });
    }
    const user = await Users.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid Token" });
    }
    if (user.role != "admin")
      return res.status(401).json({ success: false, message: "Access Denied" });
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

exports.staticFileMiddleware = express.static(
  path.join(__dirname, "../public")
);
