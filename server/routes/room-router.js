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
  getPropertyById,
  propertyCreate,
  searchProperties,
  updateProperty,
} from "../controller/propertyController.js";
import {
  addRoomToProperty,
  deleteRoom,
  getRooms,
  getRoomsById,
  getRoomsByPropertyId,
  updateRoom,
} from "../controller/roomController.js";
import { upload } from "../helpers/uploadFile.js";

const app = express();

const uploadRoomImages = upload.fields([{ name: "image", maxCount: 10 }]);
app.post(
  "/addRoomToProperty",
  // checkVendorAuthMiddleware,
  // checkAdminAuthMiddleware,
  upload.array("uploadRoomImages", 10),
  addRoomToProperty
);

// Get all Rooms
app.get(
  "/getRooms",
  // checkAuthMiddleware,
  getRooms
);

// Get a Room by ID
app.get(
  "/getRoomsById/:id",
  // checkAuthMiddleware,
  getRoomsById
);
// Get a Rooms by  propertyID
app.get(
  "/getRoomsByPropertyId/:id",
  // checkAuthMiddleware,
  getRoomsByPropertyId
);

// Update a room by ID
app.put(
  "/updateRoom/:id",
  // checkAdminAuthMiddleware,
  upload.none("image"),
  updateRoom
);

// Delete a Room by ID
app.delete(
  "/deleteRoom/:id",
  // checkAdminAuthMiddleware,\
  upload.none("image"),
  deleteRoom
);
export default app;
