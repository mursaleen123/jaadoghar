import mongoose from "mongoose";
import { fileURLToPath } from "url";
import PropertyDetails from "../models/property.js";
import PropertyRooms from "../models/propertyRooms.js";
const __filename = fileURLToPath(import.meta.url);

export const propertyCreate = async (req, res) => {
  try {
    const {
      dateOfLaunch,
      propertyName,
      GST,
      location,
      description,
      mealsDescription,
      HouseRulesThingstoNote,
      LocationKnowHow,
      price,
      capacity,
      amenities,
      collections,
      experiences,
      filters,
      meals,
      status,
      taxesAndCancellations,
      rules,
      childrenAge,
      careTaker,
      host,
      seo,
      additionalHost,
      fee,
      rooms,
      user_id,
    } = req.body;

    const newProperty = new PropertyDetails({
      dateOfLaunch,
      propertyName,
      GST,
      location,
      description,
      mealsDescription,
      HouseRulesThingstoNote,
      LocationKnowHow,
      price,
      fee,
      capacity,
      amenities,
      collections,
      experiences,
      filters,
      meals,
      status,
      taxesAndCancellations,
      rules,
      childrenAge,
      careTaker,
      host,
      seo,
      additionalHost,
      user_id,
    });

    const property = await newProperty.save();
    const propertyId = property._id;

    const roomsWithPropertyId = rooms.map((room) => ({
      ...room,
      propertyId,
    }));

    await Promise.all(
      roomsWithPropertyId.map((room) => addRoomToProperty(room))
    );
    res.status(200).json({
      data: { property },
      success: true,
      message: "Property Added Successfully",
      code: "propertyCreateAPI",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: error.message,
    });
  }
};
export const addRoomToProperty = async (room) => {
  try {
    const {
      propertyId,
      name,
      capacity,
      beds,
      similarRooms,
      size,
      enquiry,
      quickBook,
      amenities,
    } = room;

    if (!propertyId || !name || !capacity || !beds || !size || !amenities) {
      throw new Error("Missing required room details.");
    }

    const newRoom = new PropertyRooms({
      propertyId,
      name,
      capacity,
      beds,
      similarRooms,
      size,
      enquiry,
      quickBook,
      amenities,
    });

    await newRoom.save();
  } catch (error) {
    console.error("Error in addRoomToProperty:", error); // Log the error for debugging
    throw error; // Re-throw the error to be handled in the propertyCreate function
  }
};
export const getProperties = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "vendor") {
      query = { user_id: req.user._id }; // Only get properties associated with the vendor
    }

    const properties = await PropertyDetails.find(query)
      .populate("amenities")
      .populate("filters")
      .populate("collections")
      .populate("experiences");

    res.status(200).json({
      data: { properties },
      success: true,
      message: "Properties Retrieved Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: error.message,
    });
  }
};

export const searchProperties = async (req, res) => {
  try {
    let properties;

    if (req.body.searchTerm) {
      const searchTerm = req.body.searchTerm;
      const regex = new RegExp(searchTerm, "i");
      properties = await PropertyDetails.aggregate([
        {
          $lookup: {
            from: "experiences",
            localField: "experiences",
            foreignField: "_id",
            as: "experiencesDetails",
          },
        },
        {
          $unwind: "$experiencesDetails",
        },
        {
          $match: {
            $or: [
              { propertyName: regex },
              { description: regex },
              { "location.city": regex },
              { "location.state": regex },
              { "experiencesDetails.name": regex },
            ],
          },
        },
        {
          $group: {
            _id: "$_id",
            propertyName: { $first: "$propertyName" },
            description: { $first: "$description" },
            location: { $first: "$location" },
            experiences: { $push: "$experiencesDetails" },
            // Include other fields you want to return here
          },
        },
      ]);
    }
    res.status(200).json({
      data: { properties },
      success: true,
      message: "Searched Property",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: error.message,
    });
  }
};

export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await PropertyDetails.findById(id)
      .populate("amenities")
      .populate("filters")
      .populate("collections")
      .populate("experiences");

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property Not Found",
      });
    }

    res.status(200).json({
      data: { property },
      success: true,
      message: "Property Retrieved Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: error.message,
    });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const property = await PropertyDetails.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property Not Found",
      });
    }

    res.status(200).json({
      data: { property },
      success: true,
      message: "Property Updated Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: error.message,
    });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await PropertyDetails.findByIdAndDelete(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Property Deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: error.message,
    });
  }
};
