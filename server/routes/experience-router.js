import express from "express";

import {
  checkAdminAuthMiddleware,
  checkAuthMiddleware,
} from "../middlewares.js"; // Ensure the correct path and file extension
import { upload } from "../helpers/uploadFile.js";
import {
  createExperience,
  deleteExperience,
  getExperieneById,
  getExperienes,
  updateExperience,
} from "../controller/experienceController.js";

const app = express();

app.use(express.json());

// Create a new Experience
app.post(
  "/addExperience",
  // checkAdminAuthMiddleware,
  upload.single("image"),
  createExperience
);

// Get all Experiences
app.get(
  "/getExperienes",
  // checkAuthMiddleware,
  getExperienes
);

// Get a specific Experience by ID
app.get(
  "/getExperiene/:id",
  // checkAuthMiddleware,
  getExperieneById
);

// Update an Experience by ID
app.put(
  "/updateExperience/:id",
  // checkAdminAuthMiddleware,
  upload.single("image"),
  updateExperience
);

// Delete an Experience by ID
app.delete("/deleteExperience/:id", checkAdminAuthMiddleware, deleteExperience);

export default app;
