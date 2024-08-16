import path from "path";
import fs from "fs";
import Destination from "../models/destinations.js";

// Create a new Destination
export const createDestination = async (req, res) => {
  try {
    const { name, description, folder } = req.body;
    const imageUrl = req.file
      ? `/images/${folder.toLowerCase()}/${req.file.filename}`
      : null;

    // Ensure the directory exists
    const uploadPath = path.join("public/images", folder);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const newDestination = new Destination({ name, imageUrl, description });
    await newDestination.save();

    res.status(200).json({
      status: true,
      data: newDestination,
      message: "Destination Created successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Destinations
export const getDestinations = async (req, res) => {
  try {
    const Destinations = await Destination.find();
    res.status(200).json({
      status: true,
      data: Destinations,
      message: "Destinations Fetched successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get an Destination by ID
export const getDestinationById = async (req, res) => {
  try {
    const Destinations = await Destination.findById(req.params.id);
    if (!Destinations) {
      return res.status(404).json({ message: "Destination not found" });
    }
    res.status(200).json({
      status: true,
      data: Destinations,
      message: "Destination Fetched successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an colletion by ID
export const updateDestination = async (req, res) => {
  try {
    const { name,  description, folder } = req.body;
    let updatedFields = { name,  description };

    if (req.file) {
      const uploadPath = path.join("public/images", folder.toLowerCase());

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      const imageUrl = `/images/${folder}/${req.file.filename}`;
      updatedFields.imageUrl = imageUrl;

    }

    const updatedDestination = await Destination.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    if (!updatedDestination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    res.status(200).json({
      status: true,
      data: updatedDestination,
      message: "Destination Updated successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an Destination by ID
export const deleteDestination = async (req, res) => {
  try {
    const deletedDestination = await Destination.findByIdAndDelete(req.params.id);
    if (!deletedDestination) {
      return res.status(404).json({ message: "Destination not found" });
    }
    res.status(200).json({
      status: true,
      data: [],
      message: "Destination deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
