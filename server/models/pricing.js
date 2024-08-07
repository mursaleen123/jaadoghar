import mongoose from "mongoose";

const pricingModelSchema = new mongoose.Schema(
  {
    ModelName: { type: String, required: false },
    key: { type: String, required: false },
    GST: { type: Number, required: false },
    CF: { type: Number, required: false },
    Persons: { type: Number, required: false },
    description: { type: String, required: false },
    isActive: { type: Boolean, required: false },
  },
  { timestamps: true }
);

const pricingModel = mongoose.model("pricingModel", pricingModelSchema);
export default pricingModel;
