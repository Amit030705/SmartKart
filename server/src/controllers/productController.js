import { Product } from '../models/Product.js';
import { PriceHistory } from '../models/PriceHistory.js';

// Helper to create a unique URL-friendly slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).substring(2, 6);
};

export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      search,
      minPrice,
      maxPrice,
      sort = 'newest',
      inStock,
      isFeatured,
      isTrending,
    } = req.query;

    const query = {};

    if (category) {
      query.category = category.toLowerCase();
    }

    if (brand) {
      const brandsArray = Array.isArray(brand) ? brand : brand.split(',');
      query.brand = { $in: brandsArray.map(b => new RegExp(`^${b.trim()}$`, 'i')) };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    if (isFeatured === 'true') {
      query.isFeatured = true;
    }

    if (isTrending === 'true') {
      query.isTrending = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'specs.processor': { $regex: search, $options: 'i' } },
        { 'specs.os': { $regex: search, $options: 'i' } },
      ];
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    switch (sort) {
      case 'price_asc':
        sortOptions = { price: 1 };
        break;
      case 'price_desc':
        sortOptions = { price: -1 };
        break;
      case 'rating':
        sortOptions = { rating: -1, reviewCount: -1 };
        break;
      case 'popular':
        sortOptions = { reviewCount: -1, rating: -1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      products,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      total,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlugOrId = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    let product;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(identifier);
    } else {
      product = await Product.findOne({ slug: identifier });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Fetch price history for visualization
    const priceHistory = await PriceHistory.find({ product: product._id })
      .sort({ recordedAt: 1 })
      .lean();

    // Related products in the same category
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .limit(4)
      .lean();

    res.status(200).json({
      success: true,
      product,
      priceHistory,
      relatedProducts,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedAndTrending = async (req, res, next) => {
  try {
    const [featured, trending, topDeals] = await Promise.all([
      Product.find({ isFeatured: true }).limit(8).lean(),
      Product.find({ isTrending: true }).limit(8).lean(),
      Product.find({ mrp: { $exists: true, $gt: 0 }, observedPrice: { $exists: true, $gt: 0 }, priceVerifiedAt: { $type: 'date' }, priceSource: { $type: 'string' }, $expr: { $gt: ['$mrp', '$observedPrice'] } })
        .sort({ rating: -1 })
        .limit(6)
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      featured: featured.length ? featured : await Product.find().limit(8).lean(),
      trending: trending.length ? trending : await Product.find().sort({ rating: -1 }).limit(8).lean(),
      topDeals,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          sampleImage: { $first: { $arrayElemAt: ['$images', 0] } },
          minPrice: { $min: '$price' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      categories: categories.map(c => ({
        name: c._id,
        count: c.count,
        sampleImage: c.sampleImage,
        minPrice: c.minPrice,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };
    if (!productData.slug) {
      productData.slug = generateSlug(productData.name);
    }

    const product = await Product.create(productData);

    // Record initial price history
    await PriceHistory.create({
      product: product._id,
      price: product.price,
      recordedAt: new Date(),
      source: 'initial_catalog_entry',
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingProduct = await Product.findById(id);

    if (!existingProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const oldPrice = existingProduct.price;
    const newPrice = req.body.price;

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    // If price changed, log in price history
    if (newPrice !== undefined && Number(newPrice) !== oldPrice) {
      await PriceHistory.create({
        product: updatedProduct._id,
        price: Number(newPrice),
        recordedAt: new Date(),
        source: 'admin_price_update',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await PriceHistory.deleteMany({ product: id });

    res.status(200).json({
      success: true,
      message: 'Product and associated records deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getPriceHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const records = await PriceHistory.find({ product: id })
      .sort({ recordedAt: 1 })
      .lean();

    if (!records || records.length === 0) {
      return res.status(200).json({
        success: true,
        history: [],
        message: 'Tracking begins when price observations become available.',
      });
    }

    const prices = records.map(r => r.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const dateRange = {
      from: records[0].recordedAt,
      to: records[records.length - 1].recordedAt,
    };

    res.status(200).json({
      success: true,
      history: records,
      minPrice,
      maxPrice,
      dateRange,
    });
  } catch (error) {
    next(error);
  }
};
