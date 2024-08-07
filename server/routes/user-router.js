import express from 'express';
import config from '../configs/index.js'; // Ensure the correct path and file extension
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
} from '../controller/userController.js'; // Ensure the correct path and file extension
import {
  checkAuthMiddleware,
  checkAdminAuthMiddleware,
} from '../middlewares.js'; // Ensure the correct path and file extension
import {
  validateRegister,
  validateLogin,
  validateOtp,
  resendOtp,
  forgetpassword,
  passwordchange,
} from '../validators/authValidator.js'; // Ensure the correct path and file extension
import validateMiddleware from '../middlewares/validationMiddleware.js'; // Ensure the correct path and file extension

const app = express();

app.post('/register', validateRegister, validateMiddleware, userRegister);
app.post('/verify-otp', validateOtp, validateMiddleware, otpVerify);
app.post('/resend-otp', resendOtp, validateMiddleware, otpResend);
app.post('/login', validateLogin, validateMiddleware, userLogin);
app.post('/forget', forgetpassword, validateMiddleware, forgetPassword);
app.post('/password-change', passwordchange, validateMiddleware, passwordChange);
app.get('/getUser', checkAuthMiddleware, getUser);
app.get('/getUserListing', getUserListing); // Uncomment if needed: checkAdminAuthMiddleware
app.get('/getVendorListing', getVendorListing);
app.post('/updateUser', checkAuthMiddleware, updateUser);

export default app;
