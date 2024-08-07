import mongoose from 'mongoose';


const AminitySchema = new mongoose.Schema({
  name: { type: String, required: false },
  type: { type: String, required: false },
  imageUrl: { type: String, required: false },
  description: { type: String, required: false },
});

const Amenities = mongoose.model("Amenities", AminitySchema);
export default Amenities;
