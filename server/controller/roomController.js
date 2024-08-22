import mongoose from "mongoose";
import { fileURLToPath } from "url";
import PropertyDetails from "../models/property.js";
import PropertyRooms from "../models/propertyRooms.js";
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
    } = req.body;
    let images;
    const folderPath = folder ? folder.toLowerCase() : "rooms";
    if (req.files["image"]) {
      images = req.files["image"].map((file) => ({
        imageUrl: `/images/${folderPath}/${file.filename}`,
      }));
    }
    const initialPrice = Number(price);
    let calculatedPrice =
      initialPrice + initialPrice * (Number(RoomConvenienceFee) / 100);


    const property = await PropertyDetails.findById(propertyId).populate("pricingModel_id")
    calculatedPrice = calculatedPrice + initialPrice * (Number(property.pricingModel_id.GST) / 100);

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
    });

    const savedRoom = await newRoom.save();

    res.status(200).json({
      status: true,
      data: savedRoom,
      message: "Room Added Successfull",
    });
  } catch (error) {
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

    const room = await PropertyRooms.findOne({ propertyId })
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
    const {
      name,
      capacity,
      size,
      beds,
      similarRooms,
      enquiry,
      quickBook,
      price,
      description,
      amenities,
    } = req.body;

    const updatedRoom = await PropertyRooms.findByIdAndUpdate(
      id,
      {
        name,
        capacity,
        size,
        beds,
        similarRooms,
        enquiry,
        quickBook,
        description,
        price,
        // images,
        amenities,
      },
      { new: true }
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
