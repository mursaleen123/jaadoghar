import { body } from 'express-validator';

const validateRegister = [
  body('email').isEmail().withMessage('Please enter a valid email address').notEmpty().withMessage('Email is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long').notEmpty().withMessage('Password is required')
];

const validateLogin = [
  body('email').isEmail().withMessage('Please enter a valid email address').notEmpty().withMessage('Email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const validateOtp = [
  body('email').isEmail().withMessage('Please enter a valid email address').notEmpty().withMessage('Email is required'),
  body('otp').isNumeric().withMessage('OTP must be numeric').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits long').notEmpty().withMessage('OTP is required')
];

export { validateRegister, validateLogin, validateOtp };