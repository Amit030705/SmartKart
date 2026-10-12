import { Router } from 'express';
import {
  getProducts,
  getProductBySlugOrId,
  getFeaturedAndTrending,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  getPriceHistory,
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { productCreateSchema, productUpdateSchema } from '../validators/productValidator.js';

const router = Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedAndTrending);
router.get('/categories', getCategories);
router.get('/:identifier', getProductBySlugOrId);
router.get('/:id/price-history', getPriceHistory);

// Admin-only endpoints
router.post('/', protect, adminOnly, validate(productCreateSchema), createProduct);
router.put('/:id', protect, adminOnly, validate(productUpdateSchema), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
