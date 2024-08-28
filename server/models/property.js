import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  state: { type: String, required: false },
  city: { type: String, required: false },
  popularCity: { type: String, required: false },
  pincode: { type: String, required: false },
  address: { type: String, required: false },
  mapUrl: { type: String, required: false },
  latitude: { type: String, required: false },
  longitude: { type: String, required: false },
});

const experienceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: String, required: true },
    showInHome: { type: String, default: "hide" },
    convenienceFee: { type: String, required: true },
    usage: { type: String, required: true },
    folder: { type: String, default: "amenities" },
    description: { type: String, required: true },
    experienceImages: { type: String, required: true },
  },
  { timestamps: true }
);

const mealSchema = new mongoose.Schema({
  name: { type: String, required: false },
  price: { type: Number, required: false },
  type: { type: String, required: false },
  time: { type: String, required: false },
  for: { type: String, required: false },
});

const feeSchema = new mongoose.Schema({
  name: { type: String, required: false },
  price: { type: String, required: false },
  type: { type: String, required: false },
  description: { type: String, required: false },
});

const taxesAndCancellationsSchema = new mongoose.Schema({
  type: { type: String, required: false },
  feeType: { type: String, required: false },
  hostPer: { type: Number, required: false },
  customerFee: { type: Number, required: false },
});

const rulesSchema = new mongoose.Schema({
  checkIn: { type: String, required: false },
  checkOut: { type: String, required: false },
  smokingAllowed: { type: Boolean, required: false },
  petsAllowed: { type: Boolean, required: false },
});

const childrenAgeSchema = new mongoose.Schema({
  min: { type: Number, required: false },
  max: { type: Number, required: false },
});

const careTakerSchema = new mongoose.Schema({
  name: { type: String, required: false },
  number: { type: String, required: false },
});

const seoSchema = new mongoose.Schema({
  title: { type: String, required: false },
  description: { type: String, required: false },
});

const additionalHostSchema = new mongoose.Schema({
  email: { type: String, required: false },
  number: { type: String, required: false },
});

const propertySchema = new mongoose.Schema(
  {
    dateOfLaunch: { type: String, required: false },
    propertyName: { type: String, required: false },
    GST: { type: Number, required: false },
    location: { type: locationSchema, required: false },
    description: { type: String, required: false },
    mealsDescription: { type: String, required: false },
    HouseRulesThingstoNote: { type: String, required: false },
    LocationKnowHow: { type: String, required: false },
    price: { type: Number, required: false },
    finalPrice: { type: Number, required: false },
    capacity: { type: String, required: false },
    amenities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Amenities",
        required: false,
      },
    ],
    filters: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Filters", required: false },
    ],
    collections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collection",
        required: false,
      },
    ],
    destinations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Destinations",
        required: false,
      },
    ],
    experiences: [experienceSchema],
    meals: [mealSchema],
    fee: [feeSchema],
    status: { type: String, required: false },
    taxesAndCancellations: {
      type: taxesAndCancellationsSchema,
      required: false,
    },
    rules: { type: rulesSchema, required: false },
    childrenAge: { type: childrenAgeSchema, required: false },
    careTaker: { type: careTakerSchema, required: false },
    host: { type: careTakerSchema, required: false },
    seo: { type: seoSchema, required: false },
    additionalHost: { type: additionalHostSchema, required: false },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
    pricingModel_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pricingModel",
      default: null,
    },
    images: [{ imageUrl: { type: String, required: true } }],
  },
  { timestamps: true }
);

const PropertyDetails = mongoose.model("Property", propertySchema);

export default PropertyDetails;
