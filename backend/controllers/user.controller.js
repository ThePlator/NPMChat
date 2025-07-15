import User from '../models/User.js';
import { generateToken } from '../lib/utils.js';
import bcrypt from 'bcryptjs';
import cloudinary from '../lib/cloudinary.js';

export const signup = async (req, res) => {
  const { email, password, name, profilPic, bio } = req.body;

  try {
    // Validate input
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: 'Email, password, and name are required.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      profilPic: profilPic || '', // Default to empty string if not provided
      bio: bio || '', // Default to empty string if not provided
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id);

    res.status(201).json({
      message: 'User created successfully.',
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        avatarUrl: newUser.avatarUrl,
        bio: newUser.bio,
      },
      token,
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required.' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful.',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
      },
      token,
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const checkAuth = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized.' });
    }

    res.status(200).json({
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        avatarUrl: req.user.avatarUrl,
        bio: req.user.bio,
      },
    });
  } catch (error) {
    console.error('Error checking authentication:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// Controller to update user profile
export const updateProfile = async (req, res) => {
  const { name, avatarUrl, bio } = req.body;
  const userId = req.user._id; // Assuming user ID is available in req.user
  let updatedData;

  try {
    if (!avatarUrl) {
      updatedData = await User.findByIdAndUpdate(
        userId,
        { name, bio },
        { new: true }
      );
    } else {
      const uploadedImage = await cloudinary.uploader.upload(avatarUrl);

      updatedData = await User.findByIdAndUpdate(
        userId,
        { name, avatarUrl: uploadedImage.secure_url, bio },
        { new: true }
      );
    }

    res.status(200).json({
      message: 'Profile updated successfully.',
      user: {
        id: updatedData._id,
        email: updatedData.email,
        name: updatedData.name,
        avatarUrl: updatedData.avatarUrl,
        bio: updatedData.bio,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
