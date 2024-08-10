import express from 'express';

import {
  checkAdminAuthMiddleware,
  checkAuthMiddleware
} from '../middlewares.js'; // Ensure the correct path and file extension
import { upload } from '../helpers/uploadFile.js';
import { createCollection, deleteCollection, getCollectionById, getCollections, updateCollection } from '../controller/collectionController.js';

const app = express();

app.use(express.json());


// Create a new Collection
app.post(
  '/addCollection',
  // checkAdminAuthMiddleware,
  upload.single('image'),  
  createCollection
);

// Get all Collections
app.get(
  '/getCollections',
  // checkAuthMiddleware, 
  getCollections
);

// Get a specific Collection by ID
app.get(
  '/getCollection/:id',
  // checkAuthMiddleware, 
  getCollectionById
);

// Update an Collection by ID
app.put(
  '/updateCollection/:id',
  // checkAdminAuthMiddleware, 
  upload.single('image'),  
  updateCollection  
);

// Delete an Collection by ID
app.delete(
  '/deleteCollection/:id',
  // checkAdminAuthMiddleware,  
  deleteCollection
);

export default app;
