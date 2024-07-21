const { body } = require("express-validator");

const validateRegister = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .notEmpty()
    .withMessage("Email is required"),
  body("phone_no").notEmpty().withMessage("Phone is required"),
  body("name").notEmpty().withMessage("Name is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .notEmpty()
    .withMessage("Password is required"),
];

const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .notEmpty()
    .withMessage("Email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const validateOtp = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .notEmpty()
    .withMessage("Email is required"),
  body("otp")
    .isNumeric()
    .withMessage("OTP must be numeric")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits long")
    .notEmpty()
    .withMessage("OTP is required"),
];

const resendOtp = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .notEmpty()
    .withMessage("Email is required"),
];

const forgetpassword = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .notEmpty()
    .withMessage("Email is required"),
];

const passwordchange = [
  body("id")
    .notEmpty()
    .withMessage("Id is required"),
  body("newPassword").notEmpty().withMessage("New Password is required"),
];

module.exports = {
  validateRegister,
  validateLogin,
  validateOtp,
  resendOtp,
  forgetpassword,
  passwordchange,
};
