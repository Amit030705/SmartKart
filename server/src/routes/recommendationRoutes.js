import { Router } from 'express';
import {
  getRecommendations,
  savePreferences,
  getUserPreferences,
} from '../controllers/recommendationController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { recommendationSchema } from '../validators/recommendationValidator.js';

const router = Router();

router.post('/', validate(recommendationSchema), getRecommendations);
router.post('/save-preferences', protect, savePreferences);
router.get('/user-preferences', protect, getUserPreferences);

export default router;
