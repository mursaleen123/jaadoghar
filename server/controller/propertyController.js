import path from "path";
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

    // Create a new PropertyDetails document
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

    // Save the new property to the database
    const property = await newProperty.save();

    // Respond with success
    res.status(200).json({
      data: { property },
      success: true,
      message: "Property Added Successfully",
      code: "propertyCreateAPI",
    });
  } catch (error) {
    // Handle errors
    return res.status(500).json({
      success: false,
      error: error.message,
      message: error.message,
    });
  }
};
