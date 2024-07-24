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
import PropertyDetails from "../models/property.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const propertyCreate = async (req, res) => {
  try {
    // Destructure fields from req.body
    const {
      dateOfLaunch,
      propertyName,
      GST,
      location,
      description,
      mealsDescription,
      HouseRulesThingstoNote,
      LocationKnowHow,
      price,
      capacity,
      amenities,
      filters,
      meals,
      status,
      taxesAndCancellations,
      rules,
      childrenAge,
      careTaker,
      host,
      seo,
      additionalHost,
    } = req.body;

    // Create a new PropertyDetails document
    const newProperty = new PropertyDetails({
      dateOfLaunch,
      propertyName,
      GST,
      location,
      description,
      mealsDescription,
      HouseRulesThingstoNote,
      LocationKnowHow,
      price,
      capacity,
      amenities,
      filters,
      meals,
      status,
      taxesAndCancellations,
      rules,
      childrenAge,
      careTaker,
      host,
      seo,
      additionalHost,
      user_id: req.user._id, 
    });

    // Save the new property to the database
    const property = await newProperty.save();

    // Respond with success
    res.status(200).json({
      data: { property },
      success: true,
      message: "Property Added Successfully",
      code: "propertyCreateAPI",
    });
  } catch (error) {
    // Handle errors
    return res.status(500).json({
      success: false,
      error: error.message,
      message: error.message,
    });
  }
};
