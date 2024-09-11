import mongoose from "mongoose";

const seasonSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: false,
  },
  name: { type: String, required: false },
  startDate: { type: String, required: false },
  endDate: { type: String, required: false },
});

const Season = mongoose.model("Season", seasonSchema);
export default Season;
