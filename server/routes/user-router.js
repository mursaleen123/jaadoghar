const express = require("express");
const config = require("../configs");
const {
  userRegister,
  otpVerify,
  userLogin,
  forgetPassword,
  passwordChange,
  otpResend,
  getUser,
  getUserListing,
  getVendorListing,
  updateUser,
} = require("../controller/userController");
const {
  checkAuthMiddleware,
  checkAdminAuthMiddleware,
} = require("../middlewares");

const app = express();

app.post("/register", userRegister);
app.post("/verify-otp", otpVerify);
app.post("/resend-otp", otpResend);
app.post("/login", userLogin);
app.post("/forget", forgetPassword);
app.post("/password-change", passwordChange);
app.get("/getUser", checkAuthMiddleware, getUser);
// app.get("/getUserListing", checkAdminAuthMiddleware, getUserListing);
app.get("/getUserListing", getUserListing);
app.get("/getVendorListing", getVendorListing);
app.post("/updateUser", checkAuthMiddleware, updateUser);

module.exports = app;
