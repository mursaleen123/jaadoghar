const { default: mongoose } = require("mongoose");

const paymentsSchema = new mongoose.Schema(
  {
    sessionObject: { type: Object },
    priceInCents: { type: String },
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    status: { type: String },
    discountedPrice: { type: String, required: false },
    discountedPer: { type: String, required: false },
    event: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
      required: false,
    },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Packages" },
  },
  { timestamps: true }
);

const paymentSchema = mongoose.model("Payments", paymentsSchema);
module.exports = paymentSchema;
