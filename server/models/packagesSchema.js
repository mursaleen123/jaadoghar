const { default: mongoose } = require("mongoose");

const packagesSchema = new mongoose.Schema(
  {
    uuid: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true, default: "sim" },
    data: { type: Number, required: true },
    validity: { type: Number, required: true },
    price: { type: String, required: true },
    packagePrice: { type: String, required: true },
    currentPrice: { type: String, required: true },
    country: { type: String, required: false },
    country_code: { type: String, required: false },
    countries: { type: String, required: false, default: "" },
    countriesNames: { type: String, required: false, default: "" },
    imageUrl: { type: String, required: true },
    key: { type: String, required: true, index: true },
    countriesArray: { type: Array, required: false, default: [] },
    package_id: { type: String, required: false, default: "", index: true },
    reigonal: { type: String, required: false, default: "" },
    margin: { type: String, required: false, default: "30" },
    is_active: { type: Boolean, required: true, default: false },  
  },
  { timestamps: true }
);

const packageSchema = mongoose.model("Packages", packagesSchema);
module.exports = packageSchema;
