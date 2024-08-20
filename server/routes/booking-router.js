import express from 'express';
import {
  createBooking,
} from '../controller/bookingController.js'; 
import { getBookings } from '../controller/bookingController.js';
import { getBookingById } from '../controller/bookingController.js';
import { deleteBooking } from '../controller/bookingController.js';
import { updateBooking } from '../controller/bookingController.js';

const app = express();

app.use(express.json());

// Create a new booking
app.post(
  '/addBooking',
  // checkAuthMiddleware,  
  createBooking
);

// Get all bookings
app.get(
  '/getBookings',
  // checkAdminAuthMiddleware, 
  getBookings
);

// Get a specific booking by ID
app.get(
  '/getBooking/:id',
  // checkAuthMiddleware,  
  getBookingById
);

// Update a booking by ID
app.put(
  '/updateBooking/:id',
  // checkAuthMiddleware,  
  updateBooking
);

// Delete a booking by ID
app.delete(
  '/deleteBooking/:id',
  // checkAdminAuthMiddleware, 
  deleteBooking
);

export default app;
