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
import { propertyCreate } from "../controller/propertyController.js";

const app = express();

app.post(
  "/addProperty",
  propertyValidate,
  validateMiddleware,
  checkVendorAuthMiddleware,
  propertyCreate
);

export default app;
