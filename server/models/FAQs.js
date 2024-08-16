import mongoose from 'mongoose';


const FAQsSchema = new mongoose.Schema({
  question: { type: String, required: false },
  answer: { type: String, required: false },
});

const FAQs = mongoose.model("FAQs", FAQsSchema);
export default FAQs;
