import mongoose from "mongoose";
const resetPasswordSchema = new mongoose.Schema(
  {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        requires: true
    },
    token: {
        type: String, 
        required: true
    },
    expiresAt: {
         type: Date, 
        required: true
    },
  },
  {
    timestamps: true,
  },
);



export const ResetPassword = mongoose.model("ResetPassword", resetPasswordSchema)

