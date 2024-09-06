import express from "express";
import config from "../configs/index.js";
import {} from "../controller/userController.js";
import {
  checkAuthMiddleware,
  checkAdminAuthMiddleware,
  checkVendorAuthMiddleware,
} from "../middlewares.js";
import {
  deleteFilter,
  filterCreate,
  getfilterById,
  getFilters,
  updateFilter,
} from "../controller/filterController.js";

const app = express();

app.post(
  "/addFilters",
  // checkVendorAuthMiddleware,
  // checkAdminAuthMiddleware,
  filterCreate
);

// Get all filters
app.get(
  "/getfilters",
  //  checkAuthMiddleware,
  getFilters
);

// Get a specific filter by ID
app.get(
  "/getfilter/:id",
  //  checkAuthMiddleware,
  getfilterById
);

// Update a filter by ID
app.put("/updatefilter/:id", checkAdminAuthMiddleware, updateFilter);

// Delete a filter by ID
app.delete("/deletefilter/:id", checkAdminAuthMiddleware, deleteFilter);
export default app;
