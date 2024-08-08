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

//Home page
const homeSchema = new mongoose.Schema({
  heroSection: {
    title: { type: String, required: false },
    description: { type: String, required: false },
    imageUrl: { type: String, required: false },
  },
  destinationSection: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
      required: false,
    },
  ],
  featureSection: {
    title: { type: String, required: false },
    description: { type: String, required: false },
    imageUrl: { type: String, required: false },
    url: { type: String, required: false },
  },
  collectionSection: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
      required: false,
    },
  ],
  experiencesSection: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Experiences",
      required: false,
    },
  ],
  knowMoreSection: {
    title: { type: String, required: false },
    description: { type: String, required: false },
    imageUrl: { type: String, required: false },
    url: { type: String, required: false },
  },
  aboutUsSection: {
    title: { type: String, required: false },
    description: { type: String, required: false },
    url: { type: String, required: false },
  },
  benefitsSection: {
    cards: [
      {
        title: { type: String, required: false },
        imageUrl: { type: String, required: false },
        description: { type: String, required: false },
      },
    ],
  },
  blogsSection: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Experiences",
      required: false,
    },
  ],
  hostSection: {
    title: { type: String, required: false },
    description: { type: String, required: false },
    imageUrl: { type: String, required: false },
    url: { type: String, required: false },
  },
});

//Privay Policy page
const privacyPolicySchema = new mongoose.Schema({
  title: { type: String, required: false },
  description: { type: String, required: false },
});

//Refund Policy page
const refundPolicySchema = new mongoose.Schema({
  title: { type: String, required: false },
  description: { type: String, required: false },
});

//Terms and Conditions Policy page
const termsPolicySchema = new mongoose.Schema({
  title: { type: String, required: false },
  description: { type: String, required: false },
});

const sectionsSchema = new mongoose.Schema(
  {
    aboutUs: { type: aboutUsSchema, required: false },
    HomePage: { type: homeSchema, required: false },
    PrivacyPolicyPage: { type: privacyPolicySchema, required: false },
    RefundPolicyPage: { type: refundPolicySchema, required: false },
    TermsPolicyPage: { type: termsPolicySchema, required: false },
  },
  { timestamps: true }
);

const Sections = mongoose.model("Sections", sectionsSchema);

export default Sections;
