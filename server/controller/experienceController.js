import Experience from "../models/experience.js";
import path from "path";
import fs from "fs";

// Create a new Experience
export const createExperience = async (req, res) => {
  try {
    const {
      name,
      description,
      folder,
      price,
      showInHome,
      convenienceFee,
      useage,
    } = req.body;
    const imageUrl = req.file
      ? `/images/${folder.toLowerCase()}/${req.file.filename}`
      : null;

    // Ensure the directory exists
    const uploadPath = path.join("public/images", folder);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const newExperience = new Experience({
      name,
      description,
      folder,
      price,
      showInHome,
      convenienceFee,
      useage,
      imageUrl,
    });
    await newExperience.save();

    res.status(201).json(newExperience);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Experience
export const getExperienes = async (req, res) => {
  try {
    const experience = await Experience.find();
    res.status(200).json(experience);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get an Experience by ID
export const getExperieneById = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }
    res.status(200).json(experience);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an Experience by ID
export const updateExperience = async (req, res) => {
  try {
    const {
      name,
      description,
      folder,
      price,
      showInHome,
      convenienceFee,
      useage,
    } = req.body;
    let updatedFields = {
      name,
      description,
      folder,
      price,
      showInHome,
      convenienceFee,
      useage,
    };

    if (req.file) {
      const uploadPath = path.join("public/images", folder.toLowerCase());

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      // Construct the new image URL
      const imageUrl = `/images/${folder}/${req.file.filename}`;
      updatedFields.imageUrl = imageUrl;

    }

    const updatedExperience = await Experience.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    if (!updatedExperience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    res.status(200).json(updatedExperience);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an exp by ID
export const deleteExperience = async (req, res) => {
  try {
    const deletedExperience = await Experience.findByIdAndDelete(req.params.id);
    if (!deletedExperience) {
      return res.status(404).json({ message: "Experience not found" });
    }
    res.status(200).json({ message: "Experience deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
