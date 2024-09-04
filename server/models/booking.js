import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PropertyRooms",
    required: true,
  },
  roomName: { type: String, required: true },
  roomCapacity: { type: Number, required: true },
  roomPrice: { type: Number, required: true },
  totalRoomPrice: { type: Number, required: true },
  guestsInRoom: { type: Number, required: true },
});

const bookingSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    specialRequest: { type: String, default: "" },
    bill: { type: Number, required: true },
    persons: { type: Number, required: true },
    childrens: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Booked", "Cancelled"],
      default: "Booked",
      required: true,
    },
    payment: {
      type: String,
      enum: ["Pending", "Paid", "Cancelled"],
      default: "Pending",
      required: true,
    },
    rooms: [roomSchema],
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
