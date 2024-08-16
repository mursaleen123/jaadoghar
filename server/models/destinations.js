import mongoose from "mongoose";

const DestinationsSchema = new mongoose.Schema({
  name: { type: String, required: false },
  imageUrl: { type: String, required: false },
  description: { type: String, required: false },
});

const Destination = mongoose.model("Destinations", DestinationsSchema);
export default Destination;
