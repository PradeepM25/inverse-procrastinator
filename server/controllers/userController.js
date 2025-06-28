import User from '../models/userModel.js';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRETE = process.env.JWT_SECRETE || 'your_jwt_secrete_here';
const TOKEN_EXPIRES = '24h';

const createToken = (userId) => {
    return jwt.sign({id: userId}, JWT_SECRETE, {expiresIn: TOKEN_EXPIRES})
};

// register function
export async function registerUser(req, res) {
    const { name, email, password } = req.body;
    
    if(!name || !email || !password) {
        return res.status(400).json({success: false, message: 'Please fill all fields'});
    }
    if(!validator.isEmail(email)) {
        return res.status(400).json({success: false, message: "Please enter valid email"});
    }
    if(password.length < 8) {
        return res.status(400).json({success: false, message: "Password must be at least 8 characters long"});
    }

    try {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if(existingUser) {
            return res.status(409).json({success: false, message: 'User already exists'});
        }
        const hashed = await bcrypt.hash(password, 10);
        const newUser = await new User({name, email: email.toLowerCase(), password: hashed});
        await newUser.save();
        const token = createToken(newUser._id);
        res.status(201).json({success: true, token, user: {id: newUser._id, name: newUser.name, email: newUser.email}});
    } 
    catch (error) {
        console.error("Some Error Occured: ", error);
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
}


// login function
export async function loginUser(req, res) {
    const { email, password } = req.body;
    if(!email || !password) {
        return res.status(400).json({success:false, message: 'Please fill all fields'});
    }
    if(!validator.isEmail(email)) {
        return res.status(400).json({success: false, message: "Please enter valid email"});
    }
    try {
        const user = await User.findOne({email: email.toLowerCase()});
        if(!user) {
            return res.status(401).json({success: false, message: 'There is no user with this email'});
        }
        const match = await bcrypt.compare(password, user.password);
        if(!match) {
            return res.status(401).json({success: false, message: 'Invalid password'});
        }
        const token = createToken(user._id);
        res.status(200).json({success: true, token, user: {id: user._id, name: user.name, email: user.email}});
    } 
    catch (error) {
        console.error("Some Error Occured: ", error);
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
}


// Get Current User
export async function getCurrentUser(req, res) {
    try {
       const user = await User.findById(req.user.id).select("name email");
       if(!user) {
        return res.status(400).json({success: false, message: 'User not found'});
       }
       return res.status(200).json({success: true, user});
    } 
    catch (error) {
        console.error("Some Error Occured: ", error);
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
}

//upadate user profile
export async function updateProfile(req, res) {
    const { name, email } = req.body;
    if(!name || !email || !validator.isEmail(email)) {
        return res.status(400).json({success: false, message: 'Please provide valid name and email'});
    }

    try {
        const userExists = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.user.id }  });
        if(userExists) {
            return res.status(409).json({success: false, message: 'Email already in use'});
        }
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, email: email.toLowerCase() },
            { new: true, runValidators: true, select: 'name email' }
        );
        res.json({success: true, user});
    } 
    catch (error) {
        console.error("Some Error Occured: ", error);
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
}

// Change Password 
export async function updatePassword(req, res) {
    const {curPassword, newPassword} = req.body;
    if(!curPassword || !newPassword || newPassword.length < 8) {
        return res.status(400).json({success: false, message: 'Please fill all fields'});
    }  

    try {
        const user = await User.findById(req.user.id).select('password');
        if(!user) {
            return res.status(404).json({success: false, message: 'User not found'});
        }
        const match = await bcrypt.compare(curPassword, user.password);
        if(!match) {
            return res.status(401).json({success: false, message: 'Current password is incorrect'});
        }
        user.password = await bcrypt.hash(newPassword,10);
        await user.save();
        res.status(200).json({success: true, message: 'Password updated successfully'});
    } 
    catch (error) {
        console.error("Some Error Occured: ", error);
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
}

//42:01