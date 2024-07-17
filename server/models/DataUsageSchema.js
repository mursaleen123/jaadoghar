const mongoose = require("mongoose");
const { Schema } = mongoose;

const DataUsageSchema = new Schema(
  {
    remaining: { type: String, required: false },
    total: { type: String, required: false, default: "USD" },
    expired_at: { type: Date, required: false }, // Changed type to Date
    is_unlimited: { type: String, required: false },
    status: { type: String, required: false },
    iccid: { type: String, required: false },
    vendorType: {
      type: String,
      enum: ["esimgo", "airalo", "esimVault"],
      default: "",
      required: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: false,
    },
    simId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sims",
      required: false,
    },
  },
  { timestamps: true }
);

DataUsageSchema.pre("save", function (next) {
  if (this.expired_at instanceof Date && this.expired_at < new Date()) {
    this.status = "ENDED";
  }
  next();
});

const DataUsage = mongoose.model("Datauseage", DataUsageSchema);

module.exports = DataUsage;
