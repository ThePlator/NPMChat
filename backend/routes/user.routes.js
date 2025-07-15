import express from 'express';
import {
  checkAuth,
  login,
  signup,
  updateProfile,
} from '../controllers/user.controller.js';
import { protectRoute } from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/login', login);
userRouter.post('/signup', signup);
userRouter.get('/check-auth', protectRoute, checkAuth);
userRouter.put('/update-profile', protectRoute, updateProfile);

export default userRouter;
