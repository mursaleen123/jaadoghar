const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone_no: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    otp: { type: String, required: false, default: null },
    otpVerified: { type: Boolean, default: false, required: false },
    countries: { type: [String], required: false },
    token: { type: String, required: false, default: "" },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
      required: true,
    },
    referralCode: { type: String, unique: true },
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", 
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (!this.referralCode) {
    this.referralCode = generateReferralCode();
  }
  next();
});

function generateReferralCode() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let referralCode = "";
  for (let i = 0; i < 8; i++) {
    referralCode += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return referralCode;
}

const Users = mongoose.model("users", userSchema);
module.exports = Users;
