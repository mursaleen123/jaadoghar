import Amenities from "../models/amenity.js";
import path from "path";
import fs from "fs";

// Create a new amenity
export const createAmenity = async (req, res) => {
  try {
    const { name, type, description, folder } = req.body;
    const imageUrl = req.file
      ? `/images/${folder.toLowerCase()}/${req.file.filename}`
      : null;

    // Ensure the directory exists
    const uploadPath = path.join("public/images", folder);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const newAmenity = new Amenities({ name, type, imageUrl, description });
    await newAmenity.save();

    res.status(201).json({data:newAmenity,message:"Successfully created"});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all amenities
export const getAmenities = async (req, res) => {
  try {
    const amenities = await Amenities.find();
    res.status(200).json({data:amenities,message:"amenities retrieved successfully"});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get an amenity by ID
export const getAmenityById = async (req, res) => {
  try {
    const amenity = await Amenities.findById(req.params.id);
    if (!amenity) {
      return res.status(404).json({ message: "Amenity not found" });
    }
    res.status(200).json({data:amenity,message:"amenity retrieved successfully"});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an amenity by ID
export const updateAmenity = async (req, res) => {
  try {
    const { name, type, description, folder } = req.body;
    let updatedFields = { name, type, description };

    if (req.file) {
      const uploadPath = path.join("public/images", folder.toLowerCase());

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      // Construct the new image URL
      const imageUrl = `/images/${folder}/${req.file.filename}`;
      updatedFields.imageUrl = imageUrl;

      // Optionally: Remove the old image file if needed
      const amenity = await Amenities.findById(req.params.id);
    }

    const updatedAmenity = await Amenities.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    if (!updatedAmenity) {
      return res.status(404).json({ message: "Amenity not found" });
    }
    res.status(200).json({ data:updatedAmenity,message: "Amenity updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an amenity by ID
export const deleteAmenity = async (req, res) => {
  try {
    const deletedAmenity = await Amenities.findByIdAndDelete(req.params.id);
    if (!deletedAmenity) {
      return res.status(404).json({ message: "Amenity not found" });
    }
    res.status(200).json({ message: "Amenity deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
