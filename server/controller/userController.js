const config = require("../configs");
const { isEmailValid } = require("../helpers/validEmail");
const Users = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mongoose = require("mongoose");
const sendEmail = require("../nodemailer");
const { generateHashedOTP } = require("../helpers/hashedOtp");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const axios = require("axios");
const emailTemplateSource = fs.readFileSync(
  path.join(__dirname, "../templates/email.handlebars"),
  "utf8"
);
const PasswordChangeEmail = handlebars.compile(emailTemplateSource);

const userRegister = async (req, res) => {
  try {
    const { name, phone_no, email, password, role } = req.body;

    if (!(name && phone_no && email && password)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Payload",
      });
    }
    if (!isEmailValid(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Email",
      });
    }

    const prevRes = await Users.findOne({ email });
    if (prevRes) {
      return res.status(409).json({
        success: false,
        message: "User Already Exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Users({
      email,
      password: hashedPassword,
      name,
      phone_no,
    });
    const user = await newUser.save();

    const jwtSecret = config.jwtSecret;
    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "1d",
    });
    user.token = token;
    user.role = role.toLowerCase() === "vendor" ? "vendor" : "user";
    await user.save();

    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      upperCase: false,
      specialChars: false,
    });
    if (user) {
      await Users.findOneAndUpdate({ email }, { otp }, { upsert: true });
      const otpVerificationTemplateSource = fs.readFileSync(
        path.join(__dirname, `../templates/otpVerification.handlebars`),
        "utf8"
      );
      const otpVerificationEMail = handlebars.compile(
        otpVerificationTemplateSource
      );

      const mailOptions = {
        from: config.support_email,
        to: [user.email],
        subject: "Account Registration OTP",
        html: otpVerificationEMail({
          otp,
          name: user?.name,
        }),
      };

      await sendEmail(mailOptions, function (error, info) {
        if (error) {
          return res.status(400).json({
            success: false,
            message: error,
          });
        }
      });
    }
    user.otp = generateHashedOTP(otp);

    await user.save();
    res.status(200).json({
      data: {
        id: user._id,
        name: user.name,
        phone_no: user.phone_no,
        email: user.email,
        otpVerified: user.otpVerified,
        token: user.token,
        role: user.role,
        referralCode: user.referralCode,
      },
      success: true,
      message: "OTP sent successfully. Please check your inbox or spam folder",
      code: "registerAPI",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: error.message,
    });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(404).json({
        success: false,
        message: "The email or password you entered is incorrect.",
      });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(404).json({
        success: false,
        message: "The email or password you entered is incorrect.",
      });

    if (!user?.otpVerified)
      return res.status(400).json({
        success: false,
        data: {
          email: user.email,
        },
        message: "Verification pending! Check email for OTP.",
      });

    const jwtSecret = config.jwtSecret;
    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "1d",
    });

    res.status(200).json({
      data: {
        id: user._id,
        name: user.name,
        phone_no: user.phone_no,
        email: user.email,
        otpVerified: user.otpVerified,
        countries: user.countries,
        token: user.token,
        role: user.role,
        token: token,
      },
      success: true,
      message: "logged in successfully.",
      code: "LoginAPI",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const otpVerify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        data: [],
        message: "The email or password you entered is incorrect.",
      });
    }

    if (user.otp != generateHashedOTP(otp)) {
      return res.status(400).json({
        success: false,
        data: [],
        message: "Incorrect OTP. Please enter the correct OTP.",
      });
    }
    user.otp = null;
    user.otpVerified = true;
    await user.save();
    res.status(200).json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name,
        phone_no: user.phone_no,
        email: user.email,
        otpVerified: user.otpVerified,
        countries: user.countries,
        token: user.token,
        role: user.role,
        referralCode: user.referralCode,
      },
      message: "Your account was created successfully. ",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to login" });
  }
};

const otpResend = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        data: [],
        message: "The email or password you entered is incorrect.",
      });
    }

    user.otp = null;
    await user.save();

    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      upperCase: false,
      specialChars: false,
    });
    const hashedOtp = generateHashedOTP(otp);
    user.otp = hashedOtp;
    await user.save();

    const otpVerificationTemplateSource = fs.readFileSync(
      path.join(__dirname, `../templates/otpVerification.handlebars`),
      "utf8"
    );
    const otpVerificationEMail = handlebars.compile(
      otpVerificationTemplateSource
    );

    const mailOptions = {
      from: config.support_email,
      to: [email],
      subject: "Resend OTP",
      html: otpVerificationEMail({
        otp,
        name: user?.name,
      }),
    };
    await sendEmail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully. Please check your inbox or spam folder.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Users.findOne({ email: email });
    if (!user)
      return res.status(404).json({
        success: false,
        message:
          "That address is either invalid, not a verified primary email or is not associated with a user account.",
      });
    const token = jwt.sign({ userId: user._id.toString() }, config.jwtSecret, {
      expiresIn: "1h",
    });

    const emailTemplateSource = fs.readFileSync(
      path.join(__dirname, `../templates/email.handlebars`),
      "utf8"
    );
    const PasswordChangeEmail = handlebars.compile(emailTemplateSource);

    const siteUrl = config.frontend_url;
    const actionUrl = siteUrl + `/new-password?token=${token}`;
    const mailOptions = {
      from: config.support_email,
      to: [email],
      subject: "Set New Password",
      html: PasswordChangeEmail({
        actionUrl,
        name: user?.name,
        email: user.email,
      }),
    };

    await sendEmail(mailOptions);
    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        phone_no: user.phone_no,
        email: user.email,
        otpVerified: user.otpVerified,
        token: user.token,
        role: user.role,
      },
      message:
        "Password reset instructions have been sent to your email. Please check your inbox.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const passwordChange = async (req, res) => {
  try {
    const { id, newPassword } = req.body;

    if (!id || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload. Please check and try again",
      });
    }

    const user = await Users.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "The email or password you entered is incorrect.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    const mailOptions = {
      from: config.support_email,
      to: [user.email],
      subject: "Password Change Confirmation",
      text: "Your password has been successfully changed.",
    };
    await sendEmail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Password updated securely!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload. Please check and try again",
      });
    }

    return res.status(200).json({
      success: true,
      data: req.user,
      message: "User Fetched Successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id, name, phone_no, email, role } = req.body;

    if (!(name && phone_no && email && role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload. Please check and try again",
      });
    }
    if (!isEmailValid(email)) {
      return res.status(400).json({
        success: false,
        message: "Email is invalid or already taken.",
      });
    }
    const prevRes = await Users.findOne({ email, role });
    if (prevRes) {
      return res.status(409).json({
        success: false,
        message: "Email is invalid or already taken.",
      });
    }

    const user = await Users.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Oops! Invalid User Request.",
      });
    }

    user.email = email;
    user.name = name;
    user.phone_no = phone_no;
    user.countries = countries;
    user.save();

    return res.status(200).json({
      success: true,
      data: user,
      message: "User Fetched Successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getUserListing = async (req, res) => {
  try {
    const user = await Users.find({ role: "user", otpVerified: true })
      .select("_id name phone_no email otpVerified role createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: user,
      message: "User Fetched Successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getVendorListing = async (req, res) => {
  try {
    const user = await Users.find({ role: "vendor", otpVerified: true })
      .select("_id name phone_no email otpVerified role createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: user,
      message: "Vendors Fetched Successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
