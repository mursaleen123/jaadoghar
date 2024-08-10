import Filters from "../models/filters.js";

// Create a new Filter
export const filterCreate = async (req, res) => {
  try {
    const { name, status, description } = req.body;
    const newFilters = new Filters({ name, status, description });
    await newFilters.save();
    res.status(201).json(newFilters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all amenities
export const getFilters = async (req, res) => {
  try {
    const filters = await Filters.find({ status: "enable" });
    res.status(200).json(filters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get an Filter by ID
export const getfilterById = async (req, res) => {
  try {
    const filter = await Filters.findById(req.params.id);
    if (!filter) {
      return res.status(404).json({ message: "Filter not found" });
    }
    res.status(200).json(filter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an Filter by ID
export const updateFilter = async (req, res) => {
  try {
    const { name, status, description } = req.body;
    const updatedFilter = await Filters.findByIdAndUpdate(
      req.params.id,
      { name, status, description },
      { new: true }
    );
    if (!updatedFilter) {
      return res.status(404).json({ message: "Filter not found" });
    }
    res.status(200).json(updatedFilter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an Filter by ID
export const deleteFilter = async (req, res) => {
  try {
    const deletedFilter = await Filters.findByIdAndDelete(req.params.id);
    if (!deletedFilter) {
      return res.status(404).json({ message: "Filter not found" });
    }
    res.status(200).json({ message: "Filter deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
