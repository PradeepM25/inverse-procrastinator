import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb://localhost:27017/Task_Manager')
        .then(() => console.log("Connected to Task_Manager successfully"))
}