import express from "express";
import {
  addSeasonToProperty,
  deleteSeasonById,
  getSeasonsByPropertyId,
  updateSeasonById,
} from "../controller/seasonController.js";
import {
  checkAdminAuthMiddleware,
  checkAuthMiddleware,
} from "../middlewares.js";

const app = express();

// Get season by property id
app.post(
  "/addSeason",
  //  checkAuthMiddleware,
  addSeasonToProperty
);

// Get a season by property ID
app.get(
  "/getSeasonsByPropertyId/:id",
  //   checkAuthMiddleware,
  getSeasonsByPropertyId
);

// Update a season by ID
app.put(
  "/updateSeason/:id",
  //  checkAdminAuthMiddleware,
  updateSeasonById
);

// Delete a season by ID
app.delete(
  "/deleteSeason/:id",
  // checkAdminAuthMiddleware,
  deleteSeasonById
);
export default app;
