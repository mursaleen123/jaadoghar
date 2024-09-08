import express from "express";
import {
  calculateCosting,
  createBooking,
  getStats,
  searchBookings,
  updateBookingStatus,
} from "../controller/bookingController.js";
import { getBookings } from "../controller/bookingController.js";
import { getBookingById } from "../controller/bookingController.js";
import { deleteBooking } from "../controller/bookingController.js";
import { updateBooking } from "../controller/bookingController.js";

const app = express();

app.use(express.json());

// Create a new booking
app.post(
  "/addBooking",
  // checkAuthMiddleware,
  createBooking
);

//Live booking and costing
app.post(
  "/calculateCosting",
  // checkAuthMiddleware,
  calculateCosting
);

//Live booking and costing
app.post(
  "/updateBookingStatus/:id",
  // checkAuthMiddleware,
  updateBookingStatus
);

// Get all bookings
app.get(
  "/getBookings",
  // checkAdminAuthMiddleware,
  getBookings
);

// search bookings
app.post(
  "/searchBookings",
  // checkAdminAuthMiddleware,
  searchBookings
);

// Get a specific booking by ID
app.get(
  "/getBooking/:id",
  // checkAuthMiddleware,
  getBookingById
);

// Get status
app.get(
  "/getStats",
  // checkAuthMiddleware,
  getStats
);

// Update a booking by ID
app.put(
  "/updateBooking/:id",
  // checkAuthMiddleware,
  updateBooking
);

// Delete a booking by ID
app.delete(
  "/deleteBooking/:id",
  // checkAdminAuthMiddleware,
  deleteBooking
);

export default app;
