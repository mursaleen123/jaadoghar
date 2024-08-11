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
      images,
      amenities,
    } = req.body;

    // Create a new room document
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
      // images,
      amenities,
    });

    // Save the room document to the database
    const savedRoom = await newRoom.save();

  
    res.status(200).json({
      status: true,
      data: savedRoom,
      message: "Room Added Successfull",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// export const getProperties = async (req, res) => {
//   try {
//     let query = {};

//     if (req.user.role === "vendor") {
//       query = { user_id: req.user._id }; // Only get properties associated with the vendor
//     }

//     const properties = await PropertyDetails.find(query)
//       .populate("amenities")
//       .populate("filters")
//       .populate("collections")
//       .populate("experiences");

//     res.status(200).json({
//       data: { properties },
//       success: true,
//       message: "Properties Retrieved Successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       
//       message: error.message,
//     });
//   }
// };

// export const searchProperties = async (req, res) => {
//   try {
//     let properties;

//     if (req.body.searchTerm) {
//       const searchTerm = req.body.searchTerm;
//       const regex = new RegExp(searchTerm, "i");
//       properties = await PropertyDetails.aggregate([
//         {
//           $lookup: {
//             from: "experiences",
//             localField: "experiences",
//             foreignField: "_id",
//             as: "experiencesDetails",
//           },
//         },
//         {
//           $unwind: "$experiencesDetails",
//         },
//         {
//           $match: {
//             $or: [
//               { propertyName: regex },
//               { description: regex },
//               { "location.city": regex },
//               { "location.state": regex },
//               { "experiencesDetails.name": regex },
//             ],
//           },
//         },
//         {
//           $group: {
//             _id: "$_id",
//             propertyName: { $first: "$propertyName" },
//             description: { $first: "$description" },
//             location: { $first: "$location" },
//             experiences: { $push: "$experiencesDetails" },
//             // Include other fields you want to return here
//           },
//         },
//       ]);
//     }
//     res.status(200).json({
//       data: { properties },
//       success: true,
//       message: "Searched Property",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       
//       message: error.message,
//     });
//   }
// };

// export const getPropertyById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const property = await PropertyDetails.findById(id)
//       .populate("amenities")
//       .populate("filters")
//       .populate("collections")
//       .populate("experiences");

//     if (!property) {
//       return res.status(404).json({
//         success: false,
//         message: "Property Not Found",
//       });
//     }

//     res.status(200).json({
//       data: { property },
//       success: true,
//       message: "Property Retrieved Successfully",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// export const updateProperty = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;

//     const property = await PropertyDetails.findByIdAndUpdate(id, updates, {
//       new: true,
//     });

//     if (!property) {
//       return res.status(404).json({
//         success: false,
//         message: "Property Not Found",
//       });
//     }

//     res.status(200).json({
//       data: { property },
//       success: true,
//       message: "Property Updated Successfully",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const deleteRoom = async (req, res) => {
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
      message: error.message,
    });
  }
};
