import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://Pradeep:119131Pradeep@cluster0.sckuy.mongodb.net/Task_Manager?retryWrites=true&w=majority')
        .then(() => console.log("Connected to Task_Manager successfully"))
}