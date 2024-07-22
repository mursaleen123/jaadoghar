import mongoose from 'mongoose';


const vendorDetailsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  address: { type: String, required: false },
  secondaryEmail: { type: String, required: false },
  secondaryContact: { type: String, required: false },
  description: { type: String, required: false },
});

const VendorDetails = mongoose.model("vendorDetails", vendorDetailsSchema);
export default VendorDetails;
