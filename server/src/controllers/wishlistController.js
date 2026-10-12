import { Wishlist } from '../models/Wishlist.js';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';

export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      select: 'name slug brand price originalPrice mrp observedPrice currency priceSource priceUrl priceVerifiedAt availability images rating stock category specs',
    }).populate({
      path: 'priceWatch.product',
      select: 'name slug price',
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [], priceWatch: [] });
    }

    res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    wishlist.products = wishlist.products.filter(p => p.toString() !== productId);
    wishlist.priceWatch = wishlist.priceWatch.filter(pw => pw.product?.toString() !== productId);
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

export const setPriceWatch = async (req, res, next) => {
  try {
    const { productId, targetPrice } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [productId] });
    }

    const existingIndex = wishlist.priceWatch.findIndex(
      pw => pw.product.toString() === productId
    );

    if (existingIndex > -1) {
      wishlist.priceWatch[existingIndex].targetPrice = targetPrice;
      wishlist.priceWatch[existingIndex].alertActive = true;
    } else {
      wishlist.priceWatch.push({
        product: productId,
        targetPrice,
        createdPrice: product.price,
        alertActive: true,
      });
    }

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: `Price alert set for ₹${targetPrice}`,
      priceWatch: wishlist.priceWatch,
    });
  } catch (error) {
    next(error);
  }
};
