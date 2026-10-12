import { Router } from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  setPriceWatch,
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);
router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:productId', removeFromWishlist);
router.post('/price-watch', setPriceWatch);

export default router;
