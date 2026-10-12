import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createOrderSchema } from '../validators/orderValidator.js';

const router = Router();

router.use(protect);
router.post('/', validate(createOrderSchema), createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);

export default router;
