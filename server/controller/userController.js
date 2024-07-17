const config = require("../configs");
const { isEmailValid } = require("../helpers/validEmail");
const Users = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const mongoose = require("mongoose");
const sendEmail = require("../nodemailer");
const { generateHashedOTP } = require("../helpers/hashedOtp");
const i18next = require("i18next");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const sims = require("../models/AiraloSimSchema");
const packageSchema = require("../models/packagesSchema");
const { getAiraloPackageUseage } = require("./airaloController");
const axios = require("axios");
const DataUsage = require("../models/DataUsageSchema");
const paymentSchema = require("../models/paymentSchema");
const emailTemplateSource = fs.readFileSync(
  path.join(__dirname, "../templates/email.handlebars"),
  "utf8"
);
const PasswordChangeEmail = handlebars.compile(emailTemplateSource);

let lang;
const userRegister = async (req, res) => {
  try {
    const { name, phone_no, email, password, countries, referralCode } =
      req.body;
    lang = req.body.lang || "en";
    if (!["en", "ar", "fr", "in"].includes(lang)) {
      lang = "en";
    }
    if (!(name && phone_no && email && password)) {
      return res.status(400).json({
        success: false,
        message: i18next.t("invalidPayload", { lng: lang }),
      });
    }
    if (!isEmailValid(email)) {
      return res.status(400).json({
        success: false,
        message: i18next.t("invalidEmail", { lng: lang }),
      });
    }

    const prevRes = await Users.findOne({ email });
    if (prevRes) {
      return res.status(409).json({
        success: false,
        message: i18next.t("userAlreadyExists", { lng: lang }),
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Users({
      email,
      password: hashedPassword,
      name,
      phone_no,
      countries,
    });
    const user = await newUser.save();

    const jwtSecret = config.jwtSecret;
    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: "1d",
    });
    user.token = token;
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
        path.join(__dirname, `../templates/${lang}/otpVerification.handlebars`),
        "utf8"
      );
      const otpVerificationEMail = handlebars.compile(
        otpVerificationTemplateSource
      );

      const mailOptions = {
        from: config.support_email,
        to: [user.email],
        subject: i18next.t("subject.AccountRegistrationOTP", { lng: lang }),
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

    if (referralCode) {
      const parentUser = await Users.findOne({ referralCode });
      user.parent_id = new mongoose.Types.ObjectId(parentUser._id);
    }
    await user.save();
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
        referralCode: user.referralCode,
        parent_id: user.parent_id ?? null,
      },
      success: true,
      message: i18next.t("optSend", { lng: lang }),
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
    lang = req.body.lang || "en";
    if (!["en", "ar", "fr", "in"].includes(lang)) {
      lang = "en";
    }
    const user = await Users.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(404).json({
        success: false,
        message: i18next.t("IncorrectCredentials", { lng: lang }),
      });

    const passwordMatch = await bcrypt.compare(password, user.password);
    const topupPurchased = await sims.findOne({ userId: user._id });
    if (!passwordMatch)
      return res.status(404).json({
        success: false,
        message: i18next.t("IncorrectCredentials", { lng: lang }),
      });

    if (!user?.otpVerified)
      return res.status(400).json({
        success: false,
        data: {
          email: user.email,
        },
        message: i18next.t("pendingVerification", { lng: lang }),
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
        referralCode: user.referralCode,
        has_topup: topupPurchased ? true : false,
        parent_id: user.parent_id ?? null,
      },
      success: true,
      message: i18next.t("welcome", { lng: lang }),
      code: "LoginAPI",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const otpVerify = async (req, res) => {
  try {
    const { email, otp } = req.body;
    lang = req.body.lang || "en";
    if (!["en", "ar", "fr", "in"].includes(lang)) {
      lang = "en";
    }

    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        data: [],
        message: i18next.t("IncorrectCredentials", { lng: lang }),
      });
    }

    if (user.otp != generateHashedOTP(otp)) {
      return res.status(400).json({
        success: false,
        data: [],
        message: i18next.t("invalidOtp", { lng: lang }),
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
        parent_id: user.parent_id ?? null,
      },
      message: i18next.t("verifiedOtp", { lng: lang }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to login" });
  }
};
const otpResend = async (req, res) => {
  try {
    const { email } = req.body;
    lang = req.body.lang || "en";
    if (!["en", "ar", "fr", "in"].includes(lang)) {
      lang = "en";
    }
    if (!["en", "ar", "fr", "in"].includes(lang)) {
      lang = "en";
    }

    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        data: [],
        message: i18next.t("IncorrectCredentials", { lng: lang }),
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
      path.join(__dirname, `../templates/${lang}/otpVerification.handlebars`),
      "utf8"
    );
    const otpVerificationEMail = handlebars.compile(
      otpVerificationTemplateSource
    );

    const mailOptions = {
      from: config.support_email,
      to: [email],
      subject: i18next.t("subject.PasswordResendtOTP", { lng: lang }),
      html: otpVerificationEMail({
        otp,
        name: user?.name,
      }),
    };
    await sendEmail(mailOptions);

    return res.status(200).json({
      success: true,
      message: i18next.t("optSend", { lng: lang }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    lang = req.body.lang || "en";
    if (!["en", "ar", "fr", "in"].includes(lang)) {
      lang = "en";
    }

    const user = await Users.findOne({ email: email });
    if (!user)
      return res.status(404).json({
        success: false,
        message: i18next.t("forgetPasswordError", { lng: lang }),
      });
    const token = jwt.sign({ userId: user._id.toString() }, config.jwtSecret, {
      expiresIn: "1h",
    });

    const emailTemplateSource = fs.readFileSync(
      path.join(__dirname, `../templates/${lang}/email.handlebars`),
      "utf8"
    );
    const PasswordChangeEmail = handlebars.compile(emailTemplateSource);

    const siteUrl = config.frontend_url;
    const actionUrl = siteUrl + `/new-password?token=${token}`;
    const mailOptions = {
      from: config.support_email,
      to: [email],
      subject: i18next.t("subject.SetNewPassword", { lng: lang }),
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
        countries: user.countries,
        token: user.token,
        role: user.role,
        parent_id: user.parent_id ?? null,
      },
      message: i18next.t("forgotPasswordEmailSent", { lng: lang }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const passwordChange = async (req, res) => {
  try {
    const { id, newPassword } = req.body;
    lang = req.body.lang || "en";
    if (!["en", "ar", "fr", "in"].includes(lang)) {
      lang = "en";
    }

    if (!id || !newPassword) {
      return res.status(400).json({
        success: false,
        message: i18next.t("invalidPayload", { lng: lang }),
      });
    }

    const user = await Users.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: i18next.t("IncorrectCredentials", { lng: lang }),
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    const mailOptions = {
      from: config.support_email,
      to: [user.email],
      subject: i18next.t("subject.PasswordChangeConfirmation", { lng: lang }),
      text: i18next.t("subject.PasswordChangeConfirmationValue", { lng: lang }),
    };
    await sendEmail(mailOptions);

    return res.status(200).json({
      success: true,
      message: i18next.t("passwordUpdated", { lng: lang }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getUser = async (req, res) => {
  try {
    const { id } = req.query;
    lang = req.query.lang || "en";

    if (!id) {
      return res.status(400).json({
        success: false,
        message: i18next.t("invalidPayload", { lng: lang }),
      });
    }

    const user = await Users.findOne({ _id: id }).select(
      "_id name phone_no email otpVerified countries role timestamps referralCode"
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: i18next.t("userNotFound", { lng: lang }),
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
      message: i18next.t("userFetched", { lng: lang }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const updateUser = async (req, res) => {
  try {
    const { id, name, phone_no, email, countries } = req.body;
    lang = req.body.lang || "en";
    if (!["en", "ar", "fr", "in"].includes(lang)) {
      lang = "en";
    }

    if (!(name && phone_no && email && countries)) {
      return res.status(400).json({
        success: false,
        message: i18next.t("invalidPayload", { lng: lang }),
      });
    }
    if (!isEmailValid(email)) {
      return res.status(400).json({
        success: false,
        message: i18next.t("invalidEmail", { lng: lang }),
      });
    }
    const prevRes = await Users.findOne({ email });
    if (prevRes) {
      return res.status(409).json({
        success: false,
        message: i18next.t("userAlreadyExists", { lng: lang }),
      });
    }

    const user = await Users.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: i18next.t("userNotFound", { lng: lang }),
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
      message: i18next.t("userFetched", { lng: lang }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const addLabel = async (req, res) => {
  try {
    const { iccid, label } = req.body;
    lang = req.body.lang || "en";
    if (!["en", "ar", "fr", "in"].includes(lang)) {
      lang = "en";
    }

    if (!(iccid && label)) {
      return res.status(400).json({
        success: false,
        message: i18next.t("invalidPayload", { lng: lang }),
      });
    }
    const simsRecords = await sims.findOne({ _id: iccid, userId: req.userId });
    if (!simsRecords) {
      return res.status(404).json({
        success: false,
        message: i18next.t("userNotFound", { lng: lang }),
      });
    }

    simsRecords.label = label;
    simsRecords.save();

    return res.status(200).json({
      success: true,
      message: i18next.t("labelAdded", { lng: lang }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getUserListing = async (req, res) => {
  try {
    lang = req.query.lang || "en";

    const user = await Users.find({ role: "user", otpVerified: true })
      .select("_id name phone_no email otpVerified countries role createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: user,
      message: i18next.t("userFetched", { lng: lang }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getUserPackages = async (req, res) => {
  const userId = req.userId;
  const lang = req.query.lang || "en";

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: i18next.t("invalidPayload", { lng: lang }),
    });
  }

  try {
    const userProjection =
      "_id name phone_no email otpVerified countries role timestamps";
    const user = await Users.findOne({ _id: userId }).select(userProjection);

    let esimsQuery = {};
    if (user?.role === "admin") {
      esimsQuery = {};
    } else {
      esimsQuery = { userId: userId };
    }

    const esims = await sims
      .find(esimsQuery)
      .sort({ createdAt: -1 })
      .populate("userId");
    const esimIds = esims.map((esim) => esim._id);
    const dataUsages = await DataUsage.find({
      simId: { $in: esimIds },
    });

    const packageIds = esims.map((esim) => esim.package_id);
    const packages = await packageSchema
      .find({ package_id: { $in: packageIds } })
      .select("package_id countries country");

    const userWithPackageId = esims.map((esim) => {
      const dataUsage = dataUsages.find((usage) =>
        usage.simId.equals(esim._id)
      );
      const packageInfo = packages.find(
        (pkg) => pkg.package_id === esim.package_id
      );

      const countries = packageInfo ? packageInfo.countries : "";
      const country = packageInfo ? packageInfo.country : "";
      const userData = {
        ...esim.toObject(),
        countries: countries,
        country: country,
        dataUseage: dataUsage || null,
      };
      return userData;
    });

    userWithPackageId.sort((a, b) => b.created_at - a.created_at);
    return res.status(200).json({
      success: true,
      data: userWithPackageId,
      message: i18next.t("userFetched", { lng: lang }),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const getUserTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    lang = req.query.lang || "en";

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: i18next.t("invalidPayload", { lng: lang }),
      });
    }
    const user = await Users.findOne({ _id: userId }).select(
      "_id name phone_no email otpVerified countries role timestamps parent_id"
    );
    let payments;
    if (user?.role === "admin") {
      payments = await paymentSchema.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userId",
          },
        },
        { $sort: { createdAt: -1 } },
        { $addFields: { package_id: "$sessionObject.metadata.package_id" } },
        {
          $lookup: {
            from: "packages",
            localField: "package_id",
            foreignField: "package_id",
            as: "package",
          },
        },
        { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
      ]);
    } else {
      payments = await paymentSchema.aggregate([
        {
          $match: {
            $or: [{ parent_id: user._id }, { userId: user._id }],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userId",
          },
        },
        { $sort: { createdAt: -1 } },
        { $addFields: { package_id: "$sessionObject.metadata.package_id" } },
        {
          $lookup: {
            from: "packages",
            localField: "package_id",
            foreignField: "package_id",
            as: "package",
          },
        },
        { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
      ]);
    }
    return res.status(200).json({
      success: true,
      data: payments,
      message: i18next.t("userFetched", { lng: lang }),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const getPackages = async (req, res) => {
  try {
    const userId = req.userId;
    lang = req.body.lang || "en";
    if (!["en", "ar", "fr", "in"].includes(lang)) {
      lang = "en";
    }
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const searchTerm = req.query.searchTerm || "";
    const sortByCol = req.query.sortByCol || "name";
    const sortByOrder = req.query.sortByOrder || "ASC";

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: i18next.t("invalidPayload", { lng: lang }),
      });
    }
    const user = await Users.findOne({ _id: userId }).select(
      "_id name phone_no email otpVerified countries role timestamps"
    );

    if (user?.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: i18next.t("accessDenied", { lng: lang }),
      });
    }

    const sortDirection = sortByOrder.toUpperCase() === "DESC" ? -1 : 1;
    const sortQuery = { [sortByCol]: sortDirection };

    const searchQuery = {
      $and: [
        {
          $or: [
            { name: { $regex: new RegExp(searchTerm, "i") } },
            { countries: { $regex: new RegExp(searchTerm, "i") } },
            { reigonal: { $regex: new RegExp(searchTerm, "i") } },
            { key: { $regex: new RegExp(searchTerm, "i") } },
          ],
        },
        { data: { $gte: 0 } },
        { type: "sim" },
      ],
    };
    const totalPackages = await packageSchema.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalPackages / perPage);

    const packages = await packageSchema
      .find(searchQuery)
      .sort(sortQuery)
      .skip((page - 1) * perPage)
      .limit(perPage);

    if (!packages) {
      return res.status(200).json({
        success: false,
        message: i18next.t("noPackagesFound", { lng: lang }),
      });
    }

    return res.status(200).json({
      success: true,
      data: packages,
      currentPage: page,
      totalPages: totalPages,
      totalItems: totalPackages,
      message: i18next.t("PackagesFound", { lng: lang }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const updatePackagesPrice = async (req, res) => {
  try {
    const userId = req.userId;
    const packagesId = req.body.packageIds;
    const price = req.body.percentage;
    lang = req.query.lang || "en";

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: i18next.t("invalidPayload", { lng: lang }),
      });
    }
    const user = await Users.findOne({ _id: userId }).select(
      "_id name phone_no email otpVerified countries role timestamps"
    );
    if (user?.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: i18next.t("accessDenied", { lng: lang }),
      });
    }

    for (const packageId of packagesId) {
      const package = await packageSchema.findOne({ package_id: packageId });
      package.price = package.packagePrice * (1 + price / 100);
      package.margin = price;
      package.save();
    }
    return res.status(200).json({
      success: true,
      message: i18next.t("priceUpdated", { lng: lang }),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const getUserPackagseStats = async () => {
  try {
    const simsRecords = await sims.find({ vendorType: "airalo" });
    console.log(simsRecords, "simsRecords");

    //   for (const sim of simsRecords) {
    //     if (sim.vendorType === "airalo") {
    //       const token_config = {
    //         method: "get",
    //         maxBodyLength: Infinity,
    //         url: config.airalo_sandbox_url + `/sims/${sim.sims[0].iccid}/usage`,
    //         headers: {
    //           Accept: "application/json",
    //           Authorization: airloToken,
    //         },
    //       };
    //       const response = await axios(token_config);
    //       console.log(response);
    //     }
    //   }
  } catch (error) {
    console.log(error);
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
  getUserPackages,
  addLabel,
  getUserPackagseStats,
  getUserListing,
  getPackages,
  updatePackagesPrice,
  updateUser,
  getUserTransactions,
};
