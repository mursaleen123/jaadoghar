const mongoose = require("mongoose");
const { Schema } = mongoose;

const topUpSchema = new Schema(
  {
    id: { type: Number, required: false },
    code: { type: String, required: false },
    currency: { type: String, required: false, default: "USD" },
    package_id: { type: String, required: false },
    quantity: { type: String, required: false, default: "1" },
    type: { type: String, required: false, default: "topup" },
    description: { type: String, required: false },
    esim_type: { type: String, required: false },
    iccid: { type: String, required: false },
    validity: { type: Number, required: false },
    package: { type: String, required: false },
    data: { type: String, required: false },
    price: { type: Number, required: false },
    discountedPer: { type: String, required: false },
    discountedPrice: { type: String, required: false },
    created_at: { type: Date, default: Date.now },
    manual_installation: {
      type: String,
      required: false,
      default: `<p><b>To manually activate the eSIM on your eSIM capable device:</b></p>
  <ol>
      <li>Settings > Cellular/Mobile > Add Cellular/Mobile Plan.</li>
      <li>Manually enter the SM-DP+ Address and activation code.</li>
      <li>Confirm eSIM plan details.</li>
      <li>Label the eSIM.</li>
  </ol>
  <p><b>To access Data:</b></p>
  <ol>
      <li>Enable data roaming.</li>
  </ol>`,
    },
    qrcode_installation: {
      type: String,
      required: false,
      default: `<p><b>To activate the eSIM by scanning the QR code on your eSIM capable device you need to print or display this QR code
  on other device:</b></p>
<ol>
<li>Settings > Cellular/Mobile > Add Cellular/Mobile Plan.</li>
<li>Scan QR code.</li>
<li>Confirm eSIM plan details.</li>
<li>Label the eSIM.</li>
</ol>
<p><b>To access Data:</b></p>
<ol>
<li>Enable data roaming.</li>
</ol>`,
    },
    installation_guides: { en: { type: String, required: false } },
    vendorType: {
      type: String,
      enum: ["esimgo", "airalo", "esimVault"],
      default: "user",
      required: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: false,
    },
  },
  { timestamps: true }
);

const topupSchema = mongoose.model("topups", topUpSchema);

module.exports = topupSchema;
