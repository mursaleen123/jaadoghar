import GeneralSettings from "../models/settings.js";

// Create or Update GST Settings
export const createOrUpdateSettings = async (req, res) => {
  try {
    const { threshold } = req.body;

    let settings = await GeneralSettings.findOne();
    if (settings) {
      settings.threshold = threshold;
    } else {
      settings = new GeneralSettings({
        threshold,
      });
    }

    await settings.save();

    res.status(200).json({
      status: true,
      data: settings,
      message: 'Settings updated successfully.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get GST Settings
export const getSettings = async (req, res) => {
  try {
    const settings = await GeneralSettings.findOne();
    if (!settings) {
      return res.status(404).json({
        status: false,
        message: 'No GST settings found.',
      });
    }

    res.status(200).json({
      status: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete GST Settings
export const deleteSettings = async (req, res) => {
  try {
    await  GeneralSettings.deleteOne();

    res.status(200).json({
      status: true,
      message: 'GST Settings deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
