const mongoose = require("mongoose");
const { Schema } = mongoose;

const simSchema = new Schema({
  id: { type: Number, required: false },
  created_at: { type: Date, required: false },
  iccid: { type: String, required: false },
  lpa: { type: String, required: false },
  imsis: { type: String, required: false },
  matching_id: { type: String, required: false },
  qrcode: { type: String, required: false },
  qrcode_url: { type: String, required: false },
  airalo_code: { type: String, required: false },
  apn_type: { type: String, required: false },
  apn_value: { type: String, required: false },
  is_roaming: { type: Boolean, required: false },
  confirmation_code: { type: String, required: false },
});

const AiraloSimSchema = new Schema({
  id: { type: Number, required: false },
  code: { type: String, required: false },
  currency: { type: String, required: false, default: "USD" },
  package_id: { type: String, required: false },
  quantity: { type: String, required: false },
  type: { type: String, required: false },
  description: { type: String, required: false },
  esim_type: { type: String, required: false },
  validity: { type: Number, required: false },
  package: { type: String, required: false },
  discountedPer: { type: String, required: false },
  discountedPrice: { type: String, required: false },
  data: { type: String, required: false },
  label: { type: String, required: false },
  price: { type: Number, required: false },
  created_at: { type: Date, required: false },
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
  sims: [simSchema],
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
});

const sims = mongoose.model("sims", AiraloSimSchema);

module.exports = sims;
