import express from "express";
import {} from "../controller/userController.js";

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
app.post("/addRoomToProperty", uploadRoomImages, addRoomToProperty);

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
  //uploadRoomImages checkAdminAuthMiddleware,
  uploadRoomImages,
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
