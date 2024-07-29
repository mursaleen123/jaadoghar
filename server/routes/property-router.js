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
import { deleteProperty, getProperties, getPropertyById, propertyCreate, updateProperty } from "../controller/propertyController.js";

const app = express();

app.post(
  "/addProperty",
  propertyValidate,
  validateMiddleware,
  // checkVendorAuthMiddleware,
  checkAdminAuthMiddleware, 
  propertyCreate
);

// Get all properties
app.get(
  '/getProperties',
  checkAuthMiddleware,
  getProperties
);

// Get a specific property by ID
app.get(
  '/getProperty/:id',
  checkAuthMiddleware,
  getPropertyById
);

// Update a property by ID
app.put(
  '/updateProperty/:id',
  checkAdminAuthMiddleware,
  updateProperty
);

// Delete a property by ID
app.delete(
  '/deleteProperty/:id',
  checkAdminAuthMiddleware,
  deleteProperty
);
export default app;
