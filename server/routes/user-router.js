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
  getUserPackages,
  getUserListing,
  getPackages,
  updatePackagesPrice,
  updateUser,
  getUserTransactions,
  addLabel,
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
app.get("/getUserListing", checkAdminAuthMiddleware, getUserListing);
app.get("/getUserPackages", checkAuthMiddleware, getUserPackages);
app.get("/getUserTransactions", checkAuthMiddleware, getUserTransactions);
app.get("/getPackages", checkAdminAuthMiddleware, getPackages);
app.post("/updatePackagesPrice", checkAdminAuthMiddleware, updatePackagesPrice);
app.post("/updateUser", checkAuthMiddleware, updateUser);
app.post("/updateUser", checkAuthMiddleware, updateUser);

app.post("/addLabel", checkAuthMiddleware, addLabel);

module.exports = app;
