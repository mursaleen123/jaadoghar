import mongoose from "mongoose";
import { fileURLToPath } from "url";
import PropertyDetails from "../models/property.js";
const __filename = fileURLToPath(import.meta.url);

export const propertyCreate = async (req, res) => {
  try {
    const {
      dateOfLaunch,
      propertyName,
      GST,
      location,
      description,
      mealsDescription,
      HouseRulesThingstoNote,
      LocationKnowHow,
      price,
      capacity,
      amenities,
      collections,
      experiences,
      filters,
      meals,
      status,
      taxesAndCancellations,
      rules,
      childrenAge,
      careTaker,
      host,
      seo,
      additionalHost,
    } = req.body;
    
    const newProperty = new PropertyDetails({
      dateOfLaunch,
      propertyName,
      GST,
      location,
      description,
      mealsDescription,
      HouseRulesThingstoNote,
      LocationKnowHow,
      price,
      capacity,
      amenities,
      collections,
      experiences,
      filters,
      meals,
      status,
      taxesAndCancellations,
      rules,
      childrenAge,
      careTaker,
      host,
      seo,
      additionalHost,
      user_id: req.user._id,
    });

    const property = await newProperty.save();

    res.status(200).json({
      data: { property },
      success: true,
      message: "Property Added Successfully",
      code: "propertyCreateAPI",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: error.message,
    });
  }
};

export const getProperties = async (req, res) => {
  try {
    const properties = await PropertyDetails.find().populate('amenities').populate('filters').populate('collections').populate('experiences');
    res.status(200).json({
      data: { properties },
      success: true,
      message: 'Properties Retrieved Successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: error.message,
    });
  }
};

export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await PropertyDetails.findById(id).populate('amenities').populate('filters').populate('collections').populate('experiences');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property Not Found',
      });
    }

    res.status(200).json({
      data: { property },
      success: true,
      message: 'Property Retrieved Successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: error.message,
    });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const property = await PropertyDetails.findByIdAndUpdate(id, updates, { new: true });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property Not Found',
      });
    }

    res.status(200).json({
      data: { property },
      success: true,
      message: 'Property Updated Successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: error.message,
    });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await PropertyDetails.findByIdAndDelete(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property Not Found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Property Deleted Successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: error.message,
    });
  }
};
