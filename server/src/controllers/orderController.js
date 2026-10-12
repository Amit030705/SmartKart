import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';

export const createOrder = async (req, res, next) => {
  const reservedStock = [];
  try {
    const { shippingAddress, paymentMethod = 'card_simulated', items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items specified' });
    }

    // Merge duplicate product lines before checking or reserving stock.
    const quantities = new Map();
    for (const item of items) {
      quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
    }

    // Server-side validation and price lookup; client supplied prices are ignored.
    let subtotal = 0;
    const orderItems = [];
    const products = new Map();
    for (const [productId, quantity] of quantities) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${productId} was not found`,
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${quantity}`,
        });
      }
      products.set(productId, product);
    }

    // Conditional updates prevent concurrent orders from overselling. Roll back
    // any reservations if a later reservation or order write fails.
    for (const [productId, quantity] of quantities) {
      const result = await Product.updateOne(
        { _id: productId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } }
      );
      if (result.modifiedCount !== 1) {
        await Promise.all(reservedStock.map(({ id, qty }) => Product.updateOne({ _id: id }, { $inc: { stock: qty } })));
        reservedStock.length = 0;
        return res.status(409).json({ success: false, message: 'Stock changed while placing the order. Please review your cart.' });
      }
      reservedStock.push({ id: productId, qty: quantity });
    }

    for (const [productId, quantity] of quantities) {
      const product = products.get(productId);
      const itemTotal = product.price * quantity;
      subtotal += itemTotal;

      // Construct immutable snapshot
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        price: product.price,
        quantity,
        specsSummary: `${product.brand} · ${product.category} · ₹${product.price}`,
      });
    }

    // Commercial calculation
    // Merchant shipping and jurisdiction-specific tax rules are not configured.
    const shippingCost = 0;
    const tax = 0;
    const total = Math.round((subtotal + shippingCost + tax) * 100) / 100;

    const orderNumber = `SC-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentResult: {
        status: 'completed',
        transactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        paidAt: new Date(),
      },
      pricing: {
        subtotal: Math.round(subtotal * 100) / 100,
        shippingCost,
        tax,
        discount: 0,
        total,
      },
      status: 'processing',
      statusHistory: [
        {
          status: 'processing',
          changedAt: new Date(),
          note: 'Order payment simulated and confirmed. Preparing shipment.',
        },
      ],
    });

    // Once the order is durable, reservations belong to it and must not roll back.
    reservedStock.length = 0;

    // Clear matching items from user's cart
    try {
      const userCart = await Cart.findOne({ user: req.user._id });
      if (userCart) {
        const orderedProductIds = [...quantities.keys()];
        userCart.items = userCart.items.filter(i => !orderedProductIds.includes(i.product.toString()));
        await userCart.save();
      }
    } catch (cartError) {
      // The order is already durable; report success rather than suggesting a retry
      // that could create a duplicate order. The cart can be cleaned up separately.
      console.error(`[Order] Could not clear cart after order ${order.orderNumber}: ${cartError.message}`);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    if (reservedStock.length) {
      await Promise.allSettled(reservedStock.map(({ id, qty }) => Product.updateOne({ _id: id }, { $inc: { stock: qty } })));
    }
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = id.startsWith('SC-') ? { orderNumber: id } : { _id: id };
    const order = await Order.findOne(query).populate('user', 'name email').lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify ownership unless user is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to view this order',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};
