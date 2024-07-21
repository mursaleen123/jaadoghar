import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        phone_no: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        otp: { type: String, required: false, default: null },
        otpVerified: { type: Boolean, default: false, required: false },
        token: { type: String, required: false, default: "" },
        role: {
            type: String,
            enum: ["admin", "user", "vendor"],
            default: "user",
            required: true,
        },
    },
    { timestamps: true }
);

const Users = mongoose.model("users", userSchema);
export default Users;
