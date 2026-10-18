import mongoose from "mongoose";

export const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Mongo DB connected successfully..!!")
    } catch (error) {
        console.log("Mongo DB connection failed", error.message)
    }
}
