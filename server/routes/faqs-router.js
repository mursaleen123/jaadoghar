import express from "express";
import {
  checkAdminAuthMiddleware,
  checkAuthMiddleware,
} from "../middlewares.js"; // Ensure the correct path and file extension
import {
  createFAQs,
  deleteFAQ,
  getFAQById,
  getFAQs,
  updateFAQ,
} from "../controller/faqsController.js";

const app = express();

app.use(express.json());

// Create a new FAQs
app.post(
  "/addFAQs",
  // checkAdminAuthMiddleware,
  createFAQs
);

// Get all FAQs
app.get(
  "/getFAQs",
  // checkAuthMiddleware,
  getFAQs
);

// Get a specific FAQs by ID
app.get(
  "/getFAQs/:id",
  //checkAuthMiddleware,
  getFAQById
);

// Update an FAQs by ID
app.put(
  "/updateFAQs/:id",
  // checkAdminAuthMiddleware,
  updateFAQ
);

// Delete an FAQs by ID
app.delete(
  "/deleteFAQs/:id",
  //checkAdminAuthMiddleware,
  deleteFAQ
);

export default app;
