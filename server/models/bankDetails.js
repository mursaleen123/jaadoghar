import mongoose from 'mongoose';

const bankDetailsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  GSTAccountName: { type: String, required: false },
  PANAccountNumber: { type: String, required: false },
  bankAccountName: { type: String, required: false },
  bankAccountNumber: { type: String, required: false },
  IFSCCode: { type: String, required: false },
  branchName: { type: String, required: false },
  accountType: { type: String, required: false },
  UPIId: { type: String, required: false },
});

const BankDetails = mongoose.model("bankDetails", bankDetailsSchema);
export default BankDetails;
