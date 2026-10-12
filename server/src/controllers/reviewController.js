import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { sort = 'newest', page = 1, limit = 10 } = req.query;

    let sortOption = { createdAt: -1 };
    if (sort === 'helpful') {
      sortOption = { helpfulVotes: -1, createdAt: -1 };
    } else if (sort === 'rating_high') {
      sortOption = { rating: -1 };
    } else if (sort === 'rating_low') {
      sortOption = { rating: 1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      Review.find({ product: productId })
        .populate('user', 'name avatar')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Review.countDocuments({ product: productId }),
    ]);

    res.status(200).json({
      success: true,
      reviews,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      total,
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this product. You can update your existing review.',
      });
    }

    // Check verified purchase by inspecting completed orders for this user & product
    const verifiedOrder = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      status: { $in: ['processing', 'shipped', 'delivered'] },
    });

    const isVerifiedPurchase = Boolean(verifiedOrder);

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      title,
      comment,
      isVerifiedPurchase,
    });

    // Recalculate average rating on product
    await Review.recalculateProductRating(productId);

    await review.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this review' });
    }

    if (req.body.rating) review.rating = req.body.rating;
    if (req.body.title) review.title = req.body.title;
    if (req.body.comment) review.comment = req.body.comment;

    await review.save();
    await Review.recalculateProductRating(review.product);

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(id);
    await Review.recalculateProductRating(productId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const voteHelpful = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndUpdate(
      id,
      { $inc: { helpfulVotes: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({
      success: true,
      helpfulVotes: review.helpfulVotes,
    });
  } catch (error) {
    next(error);
  }
};
