import mongoose from "mongoose";

const loginOtpSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    otp: {
        type: String, 
        required: true
    },
    expiresAt: {
        type: Date, 
        required: true
    }
}, {
    timestamps: true
})


export const LoginOtp = mongoose.model("LoginOtp", loginOtpSchema)
