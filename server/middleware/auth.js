import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';


const JWT_SECRETE = process.env.JWT_SECRETE || 'your_jwt_secrete_here';

export default async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startswith('Bearer ')) {
        return res.status(401).json({success: false, message: 'Unauthorized access'});
    }
    const token = authHeader.split(' ')[1];

    // verify & attach user object to request
    try {
        const payload = jwt.verify(token, JWT_SECRETE);
        const user = await User.findById(payload.id).select('-password');
        if(!user) {
            return res.status(401).json({success: false, message: 'user not found'});
        }
        req.user = user;
        next();
    } 
    catch (error) {
        return res.status(401).json({success: false, message: 'Token invalid or expired'});
    }

}