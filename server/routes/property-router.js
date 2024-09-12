import express from "express";
import config from "../configs/index.js"; // Ensure the correct path and file extension
import {} from "../controller/userController.js"; // Ensure the correct path and file extension
import {
  checkAuthMiddleware,
  checkAdminAuthMiddleware,
  checkVendorAuthMiddleware,
} from "../middlewares.js"; // Ensure the correct path and file extension

import validateMiddleware from "../middlewares/validationMiddleware.js"; // Ensure the correct path and file extension
import { propertyValidate } from "../validators/propertyValidator.js";
import {
  deleteProperty,
  getProperties,
  getPropertiesByDestination,
  getPropertiesByPrice,
  getPropertyById,
  propertyCreate,
  searchProperties,
  updateProperty,
} from "../controller/propertyController.js";
import { upload } from "../helpers/uploadFile.js";

const app = express();
export const uploadPropertyImages = upload.fields([
  { name: "images", maxCount: 20 },
  { name: "experienceImages", maxCount: 10 },
]);
app.post(
  "/addProperty",
  // propertyValidate,
  // validateMiddleware,
  // checkVendorAuthMiddleware,
  // checkAdminAuthMiddleware,
  uploadPropertyImages,
  propertyCreate
);

// Get all properties
app.get(
  "/getProperties",
  // checkAuthMiddleware,
  getProperties
);

// Get all properties
app.get("/searchProperties", searchProperties);

// Get a specific property by ID
app.get(
  "/getProperty/:id",
  //  checkAuthMiddleware,
  getPropertyById
);
app.get(
  "/getPropertiesByDestination/:destination",
  //  checkAuthMiddleware,
  getPropertiesByDestination
);
app.get(
  "/getPropertiesByPrice/:price",
  //  checkAuthMiddleware,
  getPropertiesByPrice
);

// Update a property by ID
app.put(
  "/updateProperty/:id",
  uploadPropertyImages,
  checkAdminAuthMiddleware,
  updateProperty
);

// Delete a property by ID
app.delete("/deleteProperty/:id", checkAdminAuthMiddleware, deleteProperty);
export default app;
