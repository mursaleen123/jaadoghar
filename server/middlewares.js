import jwt from 'jsonwebtoken';
import config from './configs/index.js'; // Ensure the correct path and file extension
import express from 'express';
import path from 'path';
import Users from './models/users.js'; // Ensure the correct path and file extension

export const checkAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication token missing" });
    }

    const auth = token.replace("Bearer ", "");
    const decoded = jwt.verify(auth, config?.jwtSecret);

    if (decoded.exp <= Date.now() / 1000) {
      return res.status(401).json({ success: false, message: "Token has expired" });
    }

    const user = await Users.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid Token" });
    }

    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Authentication failed" });
  }
};
export const checkVendorAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication token missing" });
    }

    const auth = token.replace("Bearer ", "");
    const decoded = jwt.verify(auth, config?.jwtSecret);

    if (decoded.exp <= Date.now() / 1000) {
      return res.status(401).json({ success: false, message: "Token has expired" });
    }

    const user = await Users.findOne({ _id: decoded.userId, role: 'vendor' });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid Token" });
    }

    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

export const checkAdminAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication token missing" });
    }

    const auth = token.replace("Bearer ", "");
    const decoded = jwt.verify(auth, config?.jwtSecret);

    if (decoded.exp <= Date.now() / 1000) {
      return res.status(401).json({ success: false, message: "Token has expired" });
    }

    const user = await Users.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid Token" });
    }

    // if (user.role !== "admin") {
    //   return res.status(401).json({ success: false, message: "Access Denied" });
    // }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export const staticFileMiddleware = express.static(path.join(__dirname, "../public"));
