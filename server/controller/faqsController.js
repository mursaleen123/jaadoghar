import FAQs from "../models/FAQs.js";

// Create a new FAQs
export const createFAQs = async (req, res) => {
  try {
    const { question, answer } = req.body;

    const newFAQ = new FAQs({ question, answer });
    await newFAQ.save();

    res.status(200).json({
      status: true,
      data: newFAQ,
      message: "FAQ Created successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all FAQs
export const getFAQs = async (req, res) => {
  try {
    const faqs = await FAQs.find();
    res.status(200).json({
      status: true,
      data: faqs,
      message: "FAQs Fetched successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get an FAQ by ID
export const getFAQById = async (req, res) => {
  try {
    const faq = await FAQs.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    res.status(200).json({
      status: true,
      data: faq,
      message: "FAQ Fetched successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an FAQ by ID
export const updateFAQ = async (req, res) => {
  try {
    const { question, answer } = req.body;
    let updatedFields = { question, answer };

    const updatedFAQ = await FAQs.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    if (!updatedFAQ) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.status(200).json({
      status: true,
      data: updatedFAQ,
      message: "FAQ Updated successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an FAQ by ID
export const deleteFAQ = async (req, res) => {
  try {
    const deletedFAQ = await FAQs.findByIdAndDelete(req.params.id);
    if (!deletedFAQ) {
      return res.status(404).json({ message: "FAQ not found" });
    }
    res.status(200).json({
      status: true,
      data: [],
      message: "FAQ deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
