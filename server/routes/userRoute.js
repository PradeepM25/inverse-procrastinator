import express from 'express';
import { getCurrentUser, registerUser, updatePassword, updateProfile } from '../controllers/userController';

const userRouter = express.Router();

// public routes

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

// private routes to protect with JWT middleware
userRouter.get('/me', getCurrentUser);
userRouter.put('/profile', updateProfile);
userRouter.put('/password', updatePassword);