import Amenities from "../models/amenity.js";
import path from "path";
import fs from "fs";
import pricingModel from "../models/pricing.js";

// Create a new PricingModel
export const addPricingModel = async (req, res) => {
  try {
    const { ModelName, key, GST, CF, Persons, description, status } = req.body;

    const existingPricingModel = await pricingModel.findOne({ Persons, key });

    if (existingPricingModel) {
      return res.status(400).json({
        message: "Pricing model with this same Conditions already exists.",
      });
    }

    // Create and save the new pricing model
    const newPricingModel = new pricingModel({
      ModelName,
      key,
      GST,
      CF,
      Persons: Persons >= 3 ? 3 : Persons,
      description,
      status,
    });
    await newPricingModel.save();

    res.status(201).json(newPricingModel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Pricing Model
export const getPricingModels = async (req, res) => {
  try {
    const pricingModels = await pricingModel.find();
    res.status(200).json(pricingModels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific Pricing Model by ID
export const getPricingModelById = async (req, res) => {
  try {
    const pricingModels = await pricingModel.findById(req.params.id);
    if (!pricingModels) {
      return res.status(404).json({ message: "Pricing Model not found" });
    }
    res.status(200).json(pricingModels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an Pricing Model by ID
export const updatePricingModel = async (req, res) => {
  try {
    const { ModelName, key, GST, CF, Persons, description, status } = req.body;

    const pricingModels = await pricingModel.findById(req.params.id);
    if (!pricingModels)
      return res.status(404).json({ message: "Pricing Model not found" });
    
    let updatedFields = {
      ModelName,
      key,
      GST,
      CF,
      Persons,
      description,
      status,
    };

    const updatedPricingModel = await pricingModel.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    if (!updatedPricingModel) {
      return res.status(404).json({ message: "Pricing Model not found" });
    }

    res.status(200).json(updatedPricingModel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an Pricing Model by ID
export const deletePricingModelById = async (req, res) => {
  try {
    const deletedModel = await pricingModel.findByIdAndDelete(req.params.id);
    if (!deletedModel) {
      return res.status(404).json({ message: "Pricing Model not found" });
    }
    res.status(200).json({ message: "Pricing Model deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
