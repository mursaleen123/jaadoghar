import express from "express";
import config from "../configs/index.js";
import {
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
} from "../controller/userController.js";
import {
  checkAuthMiddleware,
  checkAdminAuthMiddleware,
} from "../middlewares.js";
import {
  validateRegister,
  validateLogin,
  validateOtp,
  resendOtp,
  forgetpassword,
  passwordchange,
} from "../validators/authValidator.js";
import validateMiddleware from "../middlewares/validationMiddleware.js";
import { upload } from "../helpers/uploadFile.js";

const app = express();

app.post(
  "/register",
  validateRegister,
  validateMiddleware,
  upload.single("image"),
  userRegister
);
app.post("/verify-otp", validateOtp, validateMiddleware, otpVerify);
app.post("/resend-otp", resendOtp, validateMiddleware, otpResend);
app.post("/login", validateLogin, validateMiddleware, userLogin);
app.post("/forget", forgetpassword, validateMiddleware, forgetPassword);
app.post(
  "/password-change",
  passwordchange,
  validateMiddleware,
  passwordChange
);
app.get("/getUser", checkAuthMiddleware, getUser);
app.get("/getUserListing", getUserListing); // Uncomment if needed: checkAdminAuthMiddleware
app.get("/getVendorListing", getVendorListing);
app.post(
  "/updateUser",
  checkAuthMiddleware,
  upload.single("image"),
  updateUser
);

export default app;
