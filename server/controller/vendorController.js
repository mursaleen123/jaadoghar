const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const fs = require("fs");
const path = require("path");
const Vendor = require("../models/vendors");
const config = require("../config");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { sendEmail, isEmailValid, generateHashedOTP } = require("../helpers");

export const registerVendor = async (req, res) => {
  try {
    const {
      name,
      contact,
      email,
      password,
      sec_email,
      sec_contact,
      description,
      gst,
      pan,
      bank_acc_name,
      bank_acc_number,
      ifsc,
      branch_name,
      account_type,
      upi,
      address,
      folder,
    } = req.body;

    let gstImgUrl = null,
      panImgUrl = null,
      chequeImgUrl = null;
    if (req.files) {
      gstImgUrl = req.files.gst_img
        ? `/images/${folder.toLowerCase()}/${req.files.gst_img[0].filename}`
        : null;
      panImgUrl = req.files.pan_img
        ? `/images/${folder.toLowerCase()}/${req.files.pan_img[0].filename}`
        : null;
      chequeImgUrl = req.files.cheque_img
        ? `/images/${folder.toLowerCase()}/${req.files.cheque_img[0].filename}`
        : null;
    }

    if (!(name && contact && email && password)) {
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

    const prevVendor = await Vendor.findOne({ email });
    if (prevVendor) {
      return res.status(409).json({
        success: false,
        message: "Email Already Exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newVendor = new Vendor({
      name,
      contact,
      email,
      password: hashedPassword,
      sec_email,
      sec_contact,
      description,
      gst,
      pan,
      bank_acc_name,
      bank_acc_number,
      ifsc,
      branch_name,
      account_type,
      upi,
      address,
      gst_img: gstImgUrl,
      pan_img: panImgUrl,
      cheque_img: chequeImgUrl,
    });

    const vendor = await newVendor.save();

    const token = jwt.sign({ vendorId: vendor._id }, config.jwtSecret, {
      expiresIn: "1d",
    });

    vendor.token = token;
    await vendor.save();

    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false,
    });

    vendor.otp = generateHashedOTP(otp);
    await vendor.save();

    if (vendor) {
      const otpVerificationTemplateSource = fs.readFileSync(
        path.join(__dirname, `../templates/otpVerification.handlebars`),
        "utf8"
      );
      const otpVerificationEMail = handlebars.compile(
        otpVerificationTemplateSource
      );
      const mailOptions = {
        from: config.email,
        to: vendor.email,
        subject: "Account Registration OTP",
        html: otpVerificationEMail({
          otp,
          name: Vendor?.name,
        }),
      };

      await sendEmail(mailOptions, function (error, info) {
        if (error) {
          return res.status(400).json({
            success: false,
            message: error.message,
          });
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: vendor._id,
        name: vendor.name,
        contact: vendor.contact,
        email: vendor.email,
        token: vendor.token,
      },
      message: "Vendor registered successfully. OTP sent to email.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getVendors = async (req, res) => {
  try {
    const { sort = "createdAt", order = "desc", search = "" } = req.query;

    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { contact: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const vendors = await Vendor.find(searchQuery).sort({
      [sort]: order === "desc" ? -1 : 1,
    });

    res.status(200).send({
      data: vendors,
      message: "Vendors retrieved successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: "An error occurred while retrieving vendors.",
      success: false,
      error: error.message,
    });
  }
};

export const deleteVendor = async (req, res) => {
  try {
    const { vendor_id } = req.body;

    if (!vendor_id) {
      return res
        .status(400)
        .send({ success: false, message: "vendor_id is missing" });
    }

    const vendor = await Vendor.findByIdAndDelete(vendor_id);

    if (!vendor) {
      return res
        .status(404)
        .send({ success: false, message: "Vendor not found" });
    }

    res.status(200).send({
      message: "Vendor successfully deleted",
      success: true,
    });
  } catch (err) {
    res.status(500).send({
      message: "An error occurred while deleting the vendor.",
      success: false,
      error: err.message,
    });
  }
};
