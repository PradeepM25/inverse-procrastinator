import express from 'express';
import { getCurrentUser, registerUser, updatePassword, updateProfile, loginUser } from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

const userRouter = express.Router();

// public routes

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

// private routes to protect with JWT middleware
userRouter.get('/me', authMiddleware, getCurrentUser);
userRouter.put('/profile', authMiddleware, updateProfile);
userRouter.put('/password', authMiddleware, updatePassword);

export default userRouter;