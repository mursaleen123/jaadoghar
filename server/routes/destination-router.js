import express from 'express';

import {
  checkAdminAuthMiddleware,
  checkAuthMiddleware
} from '../middlewares.js'; // Ensure the correct path and file extension
import { upload } from '../helpers/uploadFile.js';
import { createDestination, deleteDestination, getDestinationById, getDestinations, updateDestination } from '../controller/destinationController.js';

const app = express();

app.use(express.json());


// Create a new Destination
app.post(
  '/addDestination',
  // checkAdminAuthMiddleware,
  upload.single('image'),  
  createDestination
);

// Get all Destinations
app.get(
  '/getDestinations',
  // checkAuthMiddleware, 
  getDestinations
);

// Get a specific Destination by ID
app.get(
  '/getDestination/:id',
  // checkAuthMiddleware, 
  getDestinationById
);

// Update an Destination by ID
app.put(
  '/updateDestination/:id',
  // checkAdminAuthMiddleware, 
  upload.single('image'),  
  updateDestination
);

// Delete an Destination by ID
app.delete(
  '/deleteDestination/:id',
  // checkAdminAuthMiddleware,  
  deleteDestination
);

export default app;
