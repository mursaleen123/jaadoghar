import mongoose from "mongoose";
import { fileURLToPath } from "url";
import PropertyDetails from "../models/property.js";
import PropertyRooms from "../models/propertyRooms.js";
import GeneralSettings from "../models/settings.js";
const __filename = fileURLToPath(import.meta.url);

export const addRoomToProperty = async (req, res) => {
  try {
    const {
      propertyId,
      name,
      capacity,
      size,
      beds,
      similarRooms,
      enquiry,
      quickBook,
      description,
      folder,
      price,
      RoomConvenienceFee,
      amenities,
      iCal1,
      iCal2,
      iCal3,
    } = req.body;

    let images;
    const folderPath = folder ? folder.toLowerCase() : "rooms";

    if (req.files["image"]) {
      images = req.files["image"].map((file) => ({
        imageUrl: `/images/${folderPath}/${file.filename}`,
      }));
    }

    const property = await PropertyDetails.findById(propertyId);
    const initialPrice = Number(price);
    const cfPercentage = Number(RoomConvenienceFee);
    let calculatedPrice = (initialPrice * cfPercentage) / 100 + initialPrice;

    let gstConfig = await GeneralSettings.findOne();

    if (!gstConfig) {
      gstConfig = new GeneralSettings({ threshold: 7500 });
    }

    if (!gstConfig.threshold) {
      gstConfig.threshold = 7500;
    }

    const gstRate = initialPrice <= gstConfig.threshold ? 12 : 18;

    // if (property.pricingModel_id && property.pricingModel_id.key) {
    //   if (property.pricingModel_id.key === "Model1") {
    //     calculatedPrice =
    //       initialPrice + initialPrice * (Number(RoomConvenienceFee) / 100);

    //     calculatedPrice =
    //       calculatedPrice + initialPrice * (Number(gstRate) / 100);
    //   } else if (
    //     property.pricingModel_id.key === "Model2" ||
    //     property.pricingModel_id.key === "Model3"
    //   ) {
    //     calculatedPrice =
    //       calculatedPrice + initialPrice * (Number(gstRate) / 100);
    //   }
    // } else {
    // calculatedPrice = initialPrice;
    // }

    const newRoom = new PropertyRooms({
      propertyId,
      name,
      capacity,
      size,
      beds,
      similarRooms,
      enquiry,
      quickBook,
      description,
      images,
      price: calculatedPrice,
      initialPrice,
      amenities,
      iCal1,
      iCal2,
      iCal3,
    });

    const savedRoom = await newRoom.save();

    res.status(200).json({
      status: true,
      data: savedRoom,
      message: "Room Added Successfully",
    });
  } catch (error) {
    console.error("Error adding room:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRooms = async (req, res) => {
  try {
    const Roooms = await PropertyRooms.find();
    res.status(200).json({
      data: { Roooms },
      success: true,
      message: "Rooms Retrieved Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

export const getRoomsById = async (req, res) => {
  try {
    const Room = await PropertyRooms.findById(req.params.id).populate(
      "amenities"
    );

    if (!Room) {
      return res.status(404).json({
        success: false,
        message: "Room Not Found",
      });
    }

    res.status(200).json({
      data: { Room },
      success: true,
      message: "Room Retrieved Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRoomsByPropertyId = async (req, res) => {
  try {
    const propertyId = req.params.id;

    const room = await PropertyRooms.find({ propertyId })
      .populate("amenities")
      .exec();
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room Not Found",
      });
    }

    res.status(200).json({
      data: { room },
      success: true,
      message: "Room Retrieved Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    let images;
    const folderPath = folder ? folder.toLowerCase() : "rooms";

    if (req.files["image"]) {
      images = req.files["image"].map((file) => ({
        imageUrl: `/images/${folderPath}/${file.filename}`,
      }));
    }
    const updatedRoom = await PropertyRooms.findByIdAndUpdate(
      id,
      { ...updates, images: images },
      {
        new: true,
      }
    );
    if (!updatedRoom) {
      return res.status(404).json({
        status: false,
        message: "Room Not Found",
      });
    }

    res.status(200).json({
      status: true,
      data: updatedRoom,
      message: "Room Updated Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRoom = await PropertyRooms.findByIdAndDelete(id);

    if (!deletedRoom) {
      return res.status(404).json({
        success: false,
        message: "Room Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Room Deleted Successfully",
      data: [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Error deleting room: ${error.message}`,
    });
  }
};
