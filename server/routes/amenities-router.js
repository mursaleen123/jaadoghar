import express from 'express';

import {
  createAmenity,
  getAmenities,
  getAmenityById,
  updateAmenity,
  deleteAmenity
} from '../controller/amenityController.js'; 

import {
  checkAdminAuthMiddleware,
  checkAuthMiddleware
} from '../middlewares.js'; // Ensure the correct path and file extension
import { upload } from '../helpers/uploadFile.js';

const app = express();

app.use(express.json());


// Create a new amenity
app.post(
  '/addAmenity',
  checkAdminAuthMiddleware,
  upload.none('image'),  
  createAmenity 
);

// Get all amenities
app.get(
  '/getAmenities',
  // checkAuthMiddleware, 
  getAmenities 
);

// Get a specific amenity by ID
app.get(
  '/getAmenity/:id',
  checkAuthMiddleware, 
  getAmenityById  
);

// Update an amenity by ID
app.put(
  '/updateAmenity/:id',
  checkAdminAuthMiddleware, 
  updateAmenity  
);

// Delete an amenity by ID
app.delete(
  '/deleteAmenity/:id',
  checkAdminAuthMiddleware,  
  deleteAmenity  
);

export default app;
