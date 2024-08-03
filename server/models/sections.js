import mongoose from "mongoose";

//About us  page
const aboutUsSchema = new mongoose.Schema({
  firstSection: {
    title: { type: String, required: false },
    description: { type: String, required: false },
    imageUrl: { type: String, required: false },
  },
  secondSection: {
    cards: [
      {
        title: { type: String, required: false },
        imageUrl: { type: String, required: false },
      },
    ],
    description: { type: String, required: false },
  },
  thirdSection: {
    title: { type: String, required: false },
    description: { type: String, required: false },
    imageUrl: { type: String, required: false },
  },
});

const sectionsSchema = new mongoose.Schema(
  {
    aboutUs: { type: aboutUsSchema, required: false },
  },
  { timestamps: true }
);

const Sections = mongoose.model("Sections", sectionsSchema);

export default Sections;
