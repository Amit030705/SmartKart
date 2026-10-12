import { User } from '../models/User.js';
import { generateToken, clearToken } from '../utils/generateToken.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address is already registered',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    generateToken(user._id, res);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        shippingAddresses: user.shippingAddresses,
        savedPreferences: user.savedPreferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    generateToken(user._id, res);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        shippingAddresses: user.shippingAddresses,
        savedPreferences: user.savedPreferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  clearToken(res);
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.avatar !== undefined) user.avatar = req.body.avatar;
    if (req.body.shippingAddresses) user.shippingAddresses = req.body.shippingAddresses;
    if (req.body.savedPreferences) {
      user.savedPreferences = {
        ...user.savedPreferences?.toObject(),
        ...req.body.savedPreferences,
      };
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        shippingAddresses: updatedUser.shippingAddresses,
        savedPreferences: updatedUser.savedPreferences,
      },
    });
  } catch (error) {
    next(error);
  }
};
