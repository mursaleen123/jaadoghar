import mongoose from "mongoose";

const propertyRoomSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: false,
  },
  name: { type: String, required: false },
  capacity: { type: Number, required: false },
  size: { type: String, required: false },
  beds: { type: Number, required: false },
  similarRooms: { type: Number, required: false },
  enquiry: { type: Boolean, required: false },
  quickBook: { type: Boolean, required: false },
  description: { type: String, required: false },
  initialPrice: { type: String, required: false },
  price: { type: String, required: false },
  image: [
    {
      imageUrl: { type: String, required: false },
    },
  ],
  amenities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Amenities",
      required: false,
    },
  ],
});

const PropertyRooms = mongoose.model("PropertyRooms", propertyRoomSchema);
export default PropertyRooms;
