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
const {
  validateRegister,
  validateLogin,
  validateOtp,
  resendOtp,
  forgetpassword,
  passwordchange,
} = require("../validators/authValidator");
const validateMiddleware = require("../middlewares/validationMiddleware");

const app = express();

app.post("/register", validateRegister, validateMiddleware, userRegister);
app.post("/verify-otp", validateOtp, validateMiddleware, otpVerify);
app.post("/resend-otp", resendOtp, validateMiddleware, otpResend);
app.post("/login", validateLogin, validateMiddleware, userLogin);
app.post("/forget", forgetpassword, validateMiddleware, forgetPassword);
app.post("/password-change", passwordchange, validateMiddleware,  passwordChange);
app.get("/getUser", checkAuthMiddleware, getUser);
// app.get("/getUserListing", checkAdminAuthMiddleware, getUserListing);
app.get("/getUserListing", getUserListing);
app.get("/getVendorListing", getVendorListing);
app.post("/updateUser", checkAuthMiddleware, updateUser);

module.exports = app;
