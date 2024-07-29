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

const mealSchema = new mongoose.Schema({
  name: { type: String, required: false },
  price: { type: String, required: false },
  type: { type: String, required: false },
  time: { type: String, required: false },
  for: { type: String, required: false },
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
    price: { type: String, required: false },
    capacity: { type: String, required: false },
    amenities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Amenities' }],
    filters: [{ type: Number, required: false }],
    meals: [mealSchema],
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
  },
  { timestamps: true }
);

const PropertyDetails = mongoose.model("Property", propertySchema);

export default PropertyDetails;
