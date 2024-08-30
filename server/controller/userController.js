import config from "../configs/index.js"; // Ensure the correct path and file extension
import { isEmailValid } from "../helpers/validEmail.js"; // Ensure the correct path and file extension
import Users from "../models/users.js"; // Ensure the correct path and file extension
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import { sendEmail } from "../nodemailer.js"; // Ensure the correct path and file extension
import { generateHashedOTP } from "../helpers/hashedOtp.js"; // Ensure the correct path and file extension
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import { fileURLToPath } from "url";
import VendorDetails from "../models/vendorDetails.js";
import BankDetails from "../models/bankDetails.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const emailTemplateSource = fs.readFileSync(
  path.join(__dirname, "../templates/email.handlebars"),
  "utf8"
);
const PasswordChangeEmail = handlebars.compile(emailTemplateSource);

const handleVendorRegistration = async (userId, vendor_details) => {
  const newVendorDetails = new VendorDetails({
    userId,
    ...vendor_details,
  });
  await newVendorDetails.save();
  return newVendorDetails._id;
};
const handleVendoBankDetails = async (userId, bank_details) => {
  const newVendorDetails = new BankDetails({
    userId,
    ...bank_details,
  });
  await newVendorDetails.save();
  return newVendorDetails._id;
};
export const userRegister = async (req, res) => {
  try {
    const {
      name,
      phone_no,
      email,
      password,
      role,
      folder,
      vendor_details,
      bank_details,
    } = req.body;

    let imageUrl = null;
    if (req.file) {
      imageUrl = req.file
        ? `/images/${folder.toLowerCase()}/${req.file.filename}`
        : null;

      const uploadPath = path.join("public/images", folder);
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
    }
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

    const prevUser = await Users.findOne({
      $or: [{ email }],
    });

    if (prevUser) {
      const message =
        prevUser.email === email
          ? "Email Already Exists"
          : "Phone Already Exists";
      return res.status(409).json({
        success: false,
        message: message,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Users({
      email,
      password: hashedPassword,
      name,
      phone_no,
      imageUrl,
    });
    const user = await newUser.save();

    const jwtSecret = config.jwtSecret;
    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "1d",
    });
    user.token = token;
    user.role = role.toLowerCase() === "vendor" ? "vendor" : "user";
    await user.save();

    if (role.toLowerCase() === "vendor") {
      const vendorDetailsId = await handleVendorRegistration(
        user._id,
        vendor_details
      );
      const vendorBankDetailsId = await handleVendoBankDetails(
        user._id,
        bank_details
      );
      user.vendor_details_id = vendorDetailsId;
      user.bank_details_id = vendorBankDetailsId;
    }

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
        from: config.email,
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
      status: true,
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
      message: "OTP sent successfully. Please check your inbox or spam folder",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const userLogin = async (req, res) => {
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
        role: user.role,
        token: token,
      },
      success: true,
      message: "logged in successfully.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const otpVerify = async (req, res) => {
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

export const otpResend = async (req, res) => {
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
      data: [],
      message: "OTP sent successfully. Please check your inbox or spam folder.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgetPassword = async (req, res) => {
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

export const passwordChange = async (req, res) => {
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

export const getUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload. Please check and try again",
      });
    }

    const user = await Users.findById(req.user._id)
      .populate("bank_details_id")
      .populate("vendor_details_id");

    return res.status(200).json({
      success: true,
      data: user,
      message: "User Fetched Successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id, name, phone_no, email, role } = req.body;
    const imageUrl = req.file
      ? `/images/${folder.toLowerCase()}/${req.file.filename}`
      : null;

    const uploadPath = path.join("public/images", folder);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
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
    user.imageUrl = imageUrl;
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

export const getUserListing = async (req, res) => {
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

export const getVendorListing = async (req, res) => {
  try {
    const user = await Users.find({ role: "vendor", otpVerified: true })
      .select("_id name phone_no email otpVerified role createdAt")
      .populate("bank_details_id")
      .populate("vendor_details_id")
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
