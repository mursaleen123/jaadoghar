import express from "express";

import {
  checkAdminAuthMiddleware,
  checkAuthMiddleware,
} from "../middlewares.js"; // Ensure the correct path and file extension
import { upload } from "../helpers/uploadFile.js";
import { createAboutUs, createHomePage, getAboutUs, getHomePage } from "../controller/sectionController.js";
import {
  getAmenities,
  updateAmenity,
} from "../controller/amenityController.js";

const app = express();

app.use(express.json());

//------------------------- ABOUT US ------------------------- //
// Create a new aboutus
const uploadAboutUsImages = upload.fields([
  { name: "sectionOneImage", maxCount: 1 },
  { name: "sectionThirdImage", maxCount: 1 },
  { name: "card1Image", maxCount: 1 },
  { name: "card2Image", maxCount: 1 },
  { name: "card3Image", maxCount: 1 },
  { name: "card4Image", maxCount: 1 },
]);

app.post(
  "/createAboutUs",
  // checkAdminAuthMiddleware,
  uploadAboutUsImages,
  createAboutUs
);

// Get  aboutus
app.get(
  "/getAboutUs",
  // checkAuthMiddleware,
  getAboutUs
);
//------------------------- ABOUT US ------------------------- //


//------------------------- HOME PAGE ------------------------- //
const uploadHomePageImages = upload.fields([
  { name: "HeroSectionImage", maxCount: 1 }, 
]);
app.post(
  "/createHomePage",
  // checkAdminAuthMiddleware,
  uploadHomePageImages,
  createHomePage
);

app.get(
  "/getHomePage",
  // checkAuthMiddleware,
  getHomePage
);

//------------------------- HOME PAGE ------------------------- //

export default app;
