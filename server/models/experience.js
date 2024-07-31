import mongoose from 'mongoose';


const ExperienceSchema = new mongoose.Schema({
  name: { type: String, required: false },
  imageUrl: { type: String, required: false },
  description: { type: String, required: false },
  price: { type: String, required: false },
  convenienceFee: { type: String, required: false },
  useage: { type: String, required: false },
  showInHome: { type: String, required: false },

});

const Experiences = mongoose.model("Experiences", ExperienceSchema);
export default Experiences;
