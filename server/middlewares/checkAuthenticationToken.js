const { jwt } = require("jsonwebtoken");

exports.checkAuthenticationToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication token missing" });
    }

    const auth = token?.replace("Bearer ", "");

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
