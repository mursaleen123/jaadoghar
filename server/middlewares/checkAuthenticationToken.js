import jwt from 'jsonwebtoken';

export const checkAuthenticationToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res
          .status(401)
          .json({ success: false, message: "Authentication token missing" });
    }

    const auth = token.replace("Bearer ", "");

    // Optional: Uncomment if token expiration check is needed
    // const decoded = jwt.verify(auth, config.jwtSecret);
    // if (decoded.exp <= Date.now() / 1000) {
    //   return res
    //     .status(401)
    //     .json({ success: false, message: "Token has expired" });
    // }

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Authentication failed" });
  }
};
