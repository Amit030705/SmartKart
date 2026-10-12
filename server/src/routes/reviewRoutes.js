import { Router } from 'express';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  voteHelpful,
} from '../controllers/reviewController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createReviewSchema, updateReviewSchema } from '../validators/reviewValidator.js';

const router = Router();

router.get('/products/:productId/reviews', getProductReviews);
router.post('/products/:productId/reviews', protect, validate(createReviewSchema), createReview);
router.put('/reviews/:id', protect, validate(updateReviewSchema), updateReview);
router.delete('/reviews/:id', protect, deleteReview);
router.post('/reviews/:id/vote', optionalAuth, voteHelpful);

export default router;
