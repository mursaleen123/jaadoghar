import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  state: { type: String, required: true },
  city: { type: String, required: true },
  popularCity: { type: String, required: true },
  pincode: { type: String, required: true },
  address: { type: String, required: true },
  mapUrl: { type: String, required: true },
  latitude: { type: String, required: true },
  longitude: { type: String, required: true },
});

const mealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  type: { type: String, required: true },
  time: { type: String, required: true },
  for: { type: String, required: true },
});

const taxesAndCancellationsSchema = new mongoose.Schema({
  type: { type: String, required: true },
  feeType: { type: String, required: true },
  hostPer: { type: Number, required: true },
  customerFee: { type: Number, required: true },
});

const rulesSchema = new mongoose.Schema({
  checkIn: { type: String, required: true },
  checkOut: { type: String, required: true },
  smokingAllowed: { type: Boolean, required: true },
  petsAllowed: { type: Boolean, required: true },
});

const childrenAgeSchema = new mongoose.Schema({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
});

const careTakerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
});

const seoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
});

const additionalHostSchema = new mongoose.Schema({
  email: { type: String, required: true },
  number: { type: String, required: true },
});

const propertySchema = new mongoose.Schema(
  {
    dateOfLaunch: { type: String, required: true },
    propertyName: { type: String, required: true },
    GST: { type: Number, required: true },
    location: { type: locationSchema, required: true },
    description: { type: String, required: true },
    mealsDescription: { type: String, required: true },
    HouseRulesThingstoNote: { type: String, required: true },
    LocationKnowHow: { type: String, required: true },
    price: { type: String, required: true },
    capacity: { type: String, required: true },
    amenities: [{ type: Number, required: true }],
    filters: [{ type: Number, required: true }],
    meals: [mealSchema],
    status: { type: String, required: true },
    taxesAndCancellations: { type: taxesAndCancellationsSchema, required: true },
    rules: { type: rulesSchema, required: true },
    childrenAge: { type: childrenAgeSchema, required: true },
    careTaker: { type: careTakerSchema, required: true },
    host: { type: careTakerSchema, required: true },
    seo: { type: seoSchema, required: true },
    additionalHost: { type: additionalHostSchema, required: true },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },
  },
  { timestamps: true }
);

const PropertyDetails = mongoose.model("Property", propertySchema);

export default PropertyDetails;
