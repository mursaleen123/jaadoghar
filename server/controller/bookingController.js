import Booking from "../models/booking.js";
import PropertyRooms from "../models/propertyRooms.js";

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
    } = req.body;

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
    });

    await newBooking.save();

    res.status(200).json({
      status: true,
      data: newBooking,
      message: "Booking created successfully.",
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
    } = req.body;
    let totalPrice = 0;

    const rooms = await PropertyRooms.find({ propertyId })
      .sort({ price: 1 })
      .exec();

    if (rooms.length < roomCount) {
      return res.status(400).json({
        message: "Not enough rooms available for the selected Property.",
      });
    }

    let totalCapacity = 0;
    let selectedRooms = [];

    for (let i = 0; i < roomCount; i++) {
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
      const roomCapacity = room.capacity;

      let guestsInRoom = Math.min(roomCapacity, remainingGuests);
      remainingGuests -= guestsInRoom;

      const roomPrice = room.price * nights;
      totalPrice += roomPrice;

      selectedRooms.push({
        roomId: room._id,
        roomName: room.name,
        roomCapacity: room.capacity,
        roomPrice: room.price,
        totalRoomPrice: roomPrice,
        guestsInRoom,
      });
    }

    res.status(200).json({
      status: true,
      data: {
        ...req.body,
        price: totalPrice,
        selectedRooms,
      },
      message: "Booking Price.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
