import path from "path";
import fs from "fs";
import Collection from "../models/collection.js";

// Create a new Collection
export const createCollection = async (req, res) => {
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

    const newCollection = new Collection({ name, imageUrl, description });
    await newCollection.save();

    res.status(201).json(newCollection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Collections
export const getCollections = async (req, res) => {
  try {
    const collections = await Collection.find();
    res.status(200).json(collections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get an Collection by ID
export const getCollectionById = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }
    res.status(200).json(collection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an colletion by ID
export const updateCollection = async (req, res) => {
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

    const updatedCollection = await Collection.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    if (!updatedCollection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    res.status(200).json(updatedCollection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an Collection by ID
export const deleteCollection = async (req, res) => {
  try {
    const deletedCollection = await Collection.findByIdAndDelete(req.params.id);
    if (!deletedCollection) {
      return res.status(404).json({ message: "Collection not found" });
    }
    res.status(200).json({ message: "Collection deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
