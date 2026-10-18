import mongoose from 'mongoose'
const emailVefiricationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    token: {
        type:String,
        required: true
    },
    expriresAt: {
        type: Date,
        requires: true
    }
},{timestamps:true})

export const EmailVerification = mongoose.model("EmailVerification", emailVefiricationSchema)
