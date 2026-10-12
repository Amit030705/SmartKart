import { Router } from 'express';
import { compareProducts } from '../controllers/compareController.js';

const router = Router();

router.post('/', compareProducts);

export default router;
