import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name slug brand price originalPrice images stock category',
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Filter out any items whose products were deleted
    cart.items = cart.items.filter(item => item.product !== null);

    // Calculate subtotal
    const subtotal = cart.items.reduce((acc, item) => {
      return acc + (item.product?.price || 0) * item.quantity;
    }, 0);

    res.status(200).json({
      success: true,
      cart: {
        _id: cart._id,
        items: cart.items,
        subtotal: Math.round(subtotal * 100) / 100,
        itemCount: cart.items.reduce((acc, item) => acc + item.quantity, 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items remaining in stock`,
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingIndex > -1) {
      const newQuantity = cart.items[existingIndex].quantity + Number(quantity);
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Reached maximum available stock of ${product.stock}`,
        });
      }
      cart.items[existingIndex].quantity = newQuantity;
      cart.items[existingIndex].priceAtAdd = product.price;
    } else {
      cart.items.push({
        product: productId,
        quantity: Number(quantity),
        priceAtAdd: product.price,
      });
    }

    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'name slug brand price originalPrice images stock category',
    });

    const subtotal = cart.items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cart: {
        _id: cart._id,
        items: cart.items,
        subtotal: Math.round(subtotal * 100) / 100,
        itemCount: cart.items.reduce((acc, item) => acc + item.quantity, 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} units currently available`,
      });
    }

    item.quantity = quantity;
    item.priceAtAdd = product.price;
    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name slug brand price originalPrice images stock category',
    });

    const subtotal = cart.items.reduce((acc, i) => acc + (i.product?.price || 0) * i.quantity, 0);

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: {
        _id: cart._id,
        items: cart.items,
        subtotal: Math.round(subtotal * 100) / 100,
        itemCount: cart.items.reduce((acc, i) => acc + i.quantity, 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name slug brand price originalPrice images stock category',
    });

    const subtotal = cart.items.reduce((acc, i) => acc + (i.product?.price || 0) * i.quantity, 0);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart: {
        _id: cart._id,
        items: cart.items,
        subtotal: Math.round(subtotal * 100) / 100,
        itemCount: cart.items.reduce((acc, i) => acc + i.quantity, 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const syncCart = async (req, res, next) => {
  try {
    const { guestItems = [] } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    for (const gItem of guestItems) {
      if (!gItem.productId) continue;
      const product = await Product.findById(gItem.productId);
      if (!product || product.stock < 1) continue;

      const existingIndex = cart.items.findIndex(
        i => i.product.toString() === gItem.productId
      );

      if (existingIndex > -1) {
        cart.items[existingIndex].quantity = Math.min(
          product.stock,
          cart.items[existingIndex].quantity + (gItem.quantity || 1)
        );
      } else {
        cart.items.push({
          product: gItem.productId,
          quantity: Math.min(product.stock, gItem.quantity || 1),
          priceAtAdd: product.price,
        });
      }
    }

    await cart.save();
    await cart.populate({
      path: 'items.product',
      select: 'name slug brand price originalPrice images stock category',
    });

    const subtotal = cart.items.reduce((acc, i) => acc + (i.product?.price || 0) * i.quantity, 0);

    res.status(200).json({
      success: true,
      message: 'Cart synchronized',
      cart: {
        _id: cart._id,
        items: cart.items,
        subtotal: Math.round(subtotal * 100) / 100,
        itemCount: cart.items.reduce((acc, i) => acc + i.quantity, 0),
      },
    });
  } catch (error) {
    next(error);
  }
};
