import Booking from "../models/booking.js";

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
    });

    await newBooking.save();

    res.status(201).json({
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
    const bookings = await Booking.find();
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
    const booking = await Booking.findById(req.params.id);
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
