import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    sec_email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    sec_contact: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    gst: {
      type: String,
      trim: true,
    },
    pan: {
      type: String,
      trim: true,
    },
    bank_acc_name: {
      type: String,
      trim: true,
    },
    bank_acc_number: {
      type: String,
      trim: true,
    },
    ifsc: {
      type: String,
      trim: true,
    },
    branch_name: {
      type: String,
      trim: true,
    },
    account_type: {
      type: String,
      enum: ["savings", "current"],
      trim: true,
    },
    upi: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    gst_img: {
      type: String,
      trim: true,
    },
    pan_img: {
      type: String,
      trim: true,
    },
    cheque_img: {
      type: String,
      trim: true,
    },
    otp: { type: String, required: false, default: null },
    otpVerified: { type: Boolean, default: false, required: false },
    token: { type: String, required: false, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Vendor", VendorSchema);
