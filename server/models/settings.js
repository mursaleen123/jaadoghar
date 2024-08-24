import mongoose from "mongoose";

const generalSettingsSchema = new mongoose.Schema(
  {
    threshold: { type: Number, required: true, default: 7500 },
  },
  { timestamps: true }
);

const GeneralSettings = mongoose.model(
  "GeneralSettings",
  generalSettingsSchema
);

export default GeneralSettings;
