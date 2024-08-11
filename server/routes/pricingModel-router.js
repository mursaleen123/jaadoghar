import express from 'express';

import { addPricingModel, deletePricingModelById, getPricingModelById, getPricingModels, updatePricingModel } from '../controller/PricingModelController.js';

const app = express();

app.use(express.json());


// Create a new Pricing Model
app.post(
  '/addPricingModel',
  // checkAdminAuthMiddleware,
  addPricingModel
);

// Get all Pricing Model
app.get(
  '/getPricingModels',
  // checkAuthMiddleware, 
  getPricingModels
);

// Get a specific Pricing Model by ID
app.get(
  '/getPricingModelById/:id',
  // checkAuthMiddleware, 
  getPricingModelById
);

// Update an Pricing Model by ID
app.put(
  '/updatePricingModel/:id',
  // checkAdminAuthMiddleware, 
  updatePricingModel
);

// Delete an Pricing Model by ID
app.delete(
  '/deletePricingModelById/:id',
  // checkAdminAuthMiddleware,  
  deletePricingModelById
);

export default app;
