import mongoose from "mongoose";

const FilterSchema = new mongoose.Schema({
  name: { type: String, required: false },
  status: {
    type: String,
    enum: ["enable", "disable"],
    default: "enable",
    required: true,
  },
  description: { type: String, required: false },
});

const Filters = mongoose.model("Filters", FilterSchema);
export default Filters;
