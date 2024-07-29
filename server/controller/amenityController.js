import Amenities from "../models/amenity.js";

// Create a new amenity
export const createAmenity = async (req, res) => {
  try {
    const { name, type, imageUrl, description } = req.body;
    const newAmenity = new  Amenities({ name, type, imageUrl, description });
    await newAmenity.save();
    res.status(201).json(newAmenity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all amenities
export const getAmenities = async (req, res) => {
  try {
    const amenities = await Amenities.find();
    res.status(200).json(amenities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get an amenity by ID
export const getAmenityById = async (req, res) => {
  try {
    const amenity = await Amenities.findById(req.params.id);
    if (!amenity) {
      return res.status(404).json({ message: 'Amenity not found' });
    }
    res.status(200).json(amenity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an amenity by ID
export const updateAmenity = async (req, res) => {
  try {
    const { name, type, imageUrl, description } = req.body;
    const updatedAmenity = await Amenities.findByIdAndUpdate(
      req.params.id,
      { name, type, imageUrl, description },
      { new: true }
    );
    if (!updatedAmenity) {
      return res.status(404).json({ message: 'Amenity not found' });
    }
    res.status(200).json(updatedAmenity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an amenity by ID
export const deleteAmenity = async (req, res) => {
  try {
    const deletedAmenity = await Amenities.findByIdAndDelete(req.params.id);
    if (!deletedAmenity) {
      return res.status(404).json({ message: 'Amenity not found' });
    }
    res.status(200).json({ message: 'Amenity deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
