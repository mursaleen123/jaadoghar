import Booking from "../models/booking.js";
import PropertyDetails from "../models/property.js";
import PropertyRooms from "../models/propertyRooms.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { createEvent } from "ics";
import { fileURLToPath } from "url";
import config from "../configs/index.js";
import handlebars from "handlebars";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import Users from "../models/users.js";
import { sendEmail } from "../nodemailer.js";

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const {
      propertyId,
      firstName,
      lastName,
      phone,
      email,
      checkIn,
      checkOut,
      bill,
      specialRequest,
      persons,
      childrens,
      payment,
      rooms,
      userId,
    } = req.body;
    console.log(req.body);
    // Create a new booking instance
    const newBooking = new Booking({
      propertyId,
      firstName,
      lastName,
      phone,
      email,
      checkIn,
      checkOut,
      bill,
      specialRequest,
      persons,
      childrens,
      payment,
      rooms,
      userId,
    });

    await newBooking.save();

    const icalDirectory = path.join(__dirname, "../../public/iCals");
    if (!fs.existsSync(icalDirectory)) {
      fs.mkdirSync(icalDirectory, { recursive: true });
    }

    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];

      // Define the event details for each room
      const event = {
        start: [
          new Date(checkIn).getUTCFullYear(),
          new Date(checkIn).getUTCMonth() + 1,
          new Date(checkIn).getUTCDate(),
        ],
        end: [
          new Date(checkOut).getUTCFullYear(),
          new Date(checkOut).getUTCMonth() + 1,
          new Date(checkOut).getUTCDate(),
        ],
        title: `Booking for ${firstName} ${lastName} - Room: ${room.roomName}`,
        description: `Room details:\n- Room Name: ${room.roomName}\n- Guests: ${room.guestsInRoom}\n- Total Price: ${room.totalRoomPrice}\n- Special Request: ${specialRequest}`,
        location: `Property ID: ${propertyId}`,
        url: `${config.server_url}/bookings/${newBooking._id}`, // Replace with your server URL
        status: "CONFIRMED",
        organizer: { name: `${firstName} ${lastName}`, email: email },
      };

      // Create the iCal event
      createEvent(event, (error, value) => {
        if (error) {
          console.log(error);
          throw new Error("Failed to generate iCal file.");
        }

        // Save the iCal file
        const icalFilename = `booking_${newBooking._id}_room_${room.roomId}.ics`;
        const icalPath = path.join(icalDirectory, icalFilename);

        fs.writeFileSync(icalPath, value);

        // Update room's iCal link
        newBooking.rooms[
          i
        ].iCal = `${config.server_url}/public/iCals/${icalFilename}`;
      });
    }

    await newBooking.save();

    const user = await Users.findById(new mongoose.Types.ObjectId(userId));

    if (!user) {
      return res.status(404).json({
        success: false,
        data: [],
        message: "The email or password you entered is incorrect.",
      });
    }

    const BookingCreatedTemplateSource = fs.readFileSync(
      path.join(__dirname, `../templates/bookingCreated.handlebars`),
      "utf8"
    );
    const bookingCreated = handlebars.compile(BookingCreatedTemplateSource);

    const mailOptions = {
      from: config.support_email,
      to: [user.email],
      subject: "Booking Confirmation",
      html: bookingCreated({
        propertyId,
        firstName,
        lastName,
        phone,
        email,
        checkIn,
        checkOut,
        bill,
        specialRequest,
        persons,
        childrens,
        payment,
        rooms,
        userId,
      }),
    };
    await sendEmail(mailOptions);

    res.status(200).json({
      status: true,
      data: newBooking,
      message: "Booking created successfully with iCal links.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Bookings
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate({
      path: "rooms.roomId",
      model: "PropertyRooms",
    });

    res.status(200).json({
      status: true,
      data: bookings,
      message: "Bookings fetched successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a Booking by ID
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: "rooms.roomId",
      model: "PropertyRooms",
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({
      status: true,
      data: booking,
      message: "Booking fetched successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a Booking by ID
export const updateBooking = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      email,
      checkIn,
      checkOut,
      bill,
      specialRequest,
      persons,
      childrens,
      payment,
      status,
      iCal,
    } = req.body;
    let updatedFields = {
      firstName,
      lastName,
      phone,
      email,
      checkIn,
      checkOut,
      bill,
      specialRequest,
      persons,
      childrens,
      payment,
      status,
      iCal,
    };

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({
      status: true,
      data: updatedBooking,
      message: "Booking updated successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a Booking by ID
export const deleteBooking = async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({
      status: true,
      data: [],
      message: "Booking deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const calculateCosting = async (req, res) => {
  try {
    const {
      propertyId,
      adultCount,
      childrenCount,
      checkIn,
      checkOut,
      roomCount,
      roomsIds,
    } = req.body;
    let totalPrice = 0;
    const rooms = await PropertyRooms.find({
      propertyId,
      _id: { $in: roomsIds },
    })
      .sort({ price: 1 })
      .exec();

    // if (rooms.length < roomsIds.length) {
    //   return res.status(400).json({
    //     message: "Not enough rooms available for the selected Property.",
    //   });
    // }

    let totalCapacity = 0;
    let selectedRooms = [];
    for (let i = 0; i < roomsIds.length; i++) {
      totalCapacity += rooms[i].capacity;
    }

    if (totalCapacity < adultCount) {
      return res.status(400).json({
        message:
          "You've selected more guests than the property can accommodate.",
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
    );

    let remainingGuests = adultCount;
    for (let i = 0; i < roomCount; i++) {
      const room = rooms[i];
      const roomCapacity = room?.capacity;

      let guestsInRoom = Math.min(roomCapacity, remainingGuests);
      remainingGuests -= guestsInRoom;

      const roomPrice = room?.price * nights;
      totalPrice += roomPrice;

      selectedRooms.push({
        roomId: room?._id,
        roomName: room?.name,
        roomCapacity: room?.capacity,
        roomPrice: room?.price,
        totalRoomPrice: totalPrice,
        guestsInRoom,
      });
    }
    let priceWithTex = 0;
    if (totalPrice < 7500) {
      priceWithTex = (totalPrice * 12) / 100 + totalPrice;
    } else {
      priceWithTex = (totalPrice * 18) / 100 + totalPrice;
    }

    res.status(200).json({
      status: true,
      data: {
        ...req.body,
        price: totalPrice,
        priceWithTex: Math.round(priceWithTex),
        selectedRooms,
      },
      message: "Booking Price.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update booking Status
export const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update only the fields that are present in the request body
    if (req.body.payment !== undefined) {
      booking.payment = req.body.payment;
    }

    if (req.body.status !== undefined) {
      booking.status = req.body.status;
    }

    await booking.save();

    res.status(200).json({
      status: true,
      data: booking,
      message: "Booking status updated successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search booking
export const searchBookings = async (req, res) => {
  try {
    const { status, propertyName, name, VendorId, BookingStatus, userName } =
      req.body;

    const filters = {
      status,
      propertyName,
      name,
      VendorId,
      BookingStatus,
      userName,
    };
    const activeFilters = Object.keys(filters).filter((key) => filters[key]);

    if (activeFilters.length > 1) {
      return res.status(400).json({
        error:
          "Please provide only one search parameter: 'status', 'propertyName', or 'name'.",
      });
    }

    if (activeFilters.length === 0) {
      return res.status(400).json({
        error:
          "Please provide a search parameter: 'status', 'propertyName', or 'name'.",
      });
    }

    let searchCriteria = {};
    let populateOptions = { path: "propertyId" };
    let userPopulateOptions = {};

    switch (activeFilters[0]) {
      case "status":
        searchCriteria.payment = status;
        break;
      case "BookingStatus":
        searchCriteria.status = BookingStatus;
        break;
      case "propertyName":
        populateOptions.match = { propertyName: new RegExp(propertyName, "i") };
        break;
      case "VendorId":
        populateOptions.match = {
          user_id: new mongoose.Types.ObjectId(VendorId),
        };
        break;
      case "name":
        searchCriteria.$or = [
          { firstName: new RegExp(name, "i") },
          { lastName: new RegExp(name, "i") },
        ];
        break;
      case "userName":
        userPopulateOptions = {
          path: "userId",
          match: {
            $or: [{ name: new RegExp(userName, "i") }],
          },
        };
        break;
    }

    const bookings = await Booking.find(searchCriteria)
      .populate(populateOptions)
      .populate(userPopulateOptions)
      .exec();

    const filteredBookings = bookings.filter((booking) => {
      if (propertyName || VendorId) {
        return booking.propertyId !== null;
      }
      if (userName) {
        return booking.userId !== null;
      }
      return true;
    });

    if (filteredBookings.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({
      status: true,
      data: filteredBookings,
      message: "Booking Fetched successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a stats by ID
export const getStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments({});
    const totalProperty = await PropertyDetails.countDocuments({});
    const totalUsers = await Users.find({ role: "user" }).countDocuments({});

    // const totalBookedBill = await Booking.aggregate([
    //   { $match: { status: "Booked" } }, // Filter documents where status is "Booked"
    //   { $group: { _id: null, totalBill: { $sum: "$bill" } } }, // Sum the 'bill' field
    // ]);

    // const totalBill =
    //   totalBookedBill.length > 0 ? totalBookedBill[0].totalBill : 0;

    res.status(200).json({
      status: true,
      data: {
        totalBookings,
        totalProperty,
        totalUsers,
        // totalBill,
      },
      message: "Stats fetched successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
