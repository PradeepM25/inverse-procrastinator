import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

// avoids "OverwriteModelError" when the model is already defined. 
const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;