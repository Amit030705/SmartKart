import { Product } from '../models/Product.js';
import { analyzeComparison } from '../services/comparisonEngine.js';

export const compareProducts = async (req, res, next) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length < 2 || productIds.length > 4) {
      return res.status(400).json({
        success: false,
        message: 'Please provide between 2 and 4 product IDs to compare',
      });
    }

    const products = await Product.find({ _id: { $in: productIds } }).lean();

    if (products.length !== productIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more selected products could not be found',
      });
    }

    const analysis = analyzeComparison(products);

    res.status(200).json({
      success: true,
      products,
      highlights: analysis.highlights,
      valueScores: analysis.valueScores,
      summary: analysis.summary,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
