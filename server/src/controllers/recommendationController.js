import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { rankRecommendations } from '../services/recommendationEngine.js';

export const getRecommendations = async (req, res, next) => {
  try {
    const { category } = req.body;

    // Fetch products belonging to the category (or all if unspecified)
    const filter = category ? { category: category.toLowerCase() } : {};
    const candidateProducts = await Product.find(filter).lean();

    const recommendationResults = rankRecommendations(candidateProducts, req.body);

    res.status(200).json(recommendationResults);
  } catch (error) {
    next(error);
  }
};

export const savePreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.savedPreferences = req.body;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Preferences saved successfully',
      savedPreferences: user.savedPreferences,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserPreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('savedPreferences');
    res.status(200).json({
      success: true,
      preferences: user?.savedPreferences || null,
    });
  } catch (error) {
    next(error);
  }
};
