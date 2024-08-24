import express from 'express';
import { createOrUpdateSettings, deleteSettings, getSettings } from '../controller/settingsController.js';

const router = express.Router();

// Create or Update GST Settings
router.post('/gst-settings', createOrUpdateSettings);

// Get GST Settings
router.get('/gst-settings', getSettings);

// Delete GST Settings
router.delete('/gst-settings', deleteSettings);

export default router;
