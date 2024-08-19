import mongoose from "mongoose";

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
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    specialRequest: { type: String, default: "" },
    bill: { type: Number, required: true },
    persons: { type: Number, required: true },
    childrens: { type: Number, required: true },
    payment: {
      type: String,
      enum: ["Pending", "Paid", "Cancelled"], 
      default: "Pending",
      required: true,
    },
    // paymentId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Payment",
    //   default: null,
    // },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
