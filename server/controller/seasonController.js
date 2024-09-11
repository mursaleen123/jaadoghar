import Season from "../models/season.js";

export const addSeasonToProperty = async (req, res) => {
  try {
    const { propertyId, name, startDate, endDate } = req.body;

    const newSeason = new Season({
      propertyId,
      name,
      startDate,
      endDate,
    });
    const saveSeason = await newSeason.save();

    res.status(200).json({
      status: true,
      data: saveSeason,
      message: "Season Added Successfull",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getSeasonsByPropertyId = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const Seasons = await Season.find({ propertyId });
    if (!Seasons) {
      res.status(404).json({
        success: false,
        message: "Season Not Found",
      });
    }
    res.status(200).json({
      data: Seasons,
      success: true,
      message: "Seasons Retrieved Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
export const deleteSeasonById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSeason = await Season.findByIdAndDelete(id);

    if (!deletedSeason) {
      return res.status(404).json({
        success: false,
        message: "Season Not Found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const updateSeasonById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate } = req.body;

    const updatedSeason = await Season.findByIdAndUpdate(
      id,
      { name, startDate, endDate },
      { new: true }
    );

    if (!updatedSeason) {
      return res.status(404).json({
        status: false,
        message: "Season Not Found",
      });
    }

    res.status(200).json({
      status: true,
      data: updatedSeason,
      message: "Season Updated Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
