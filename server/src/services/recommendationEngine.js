/**
 * SmartCart Preference-Based Recommendation Engine
 * Real, explainable, multi-criteria recommendation scoring algorithm.
 */

// Baseline weights by use case
const USE_CASE_PROFILES = {
  'Gaming': {
    performance: 5,
    display: 5,
    storage: 4,
    battery: 3,
    portability: 2,
    price: 2,
    reliability: 4,
    camera: 2,
  },
  'Office & Productivity': {
    performance: 3,
    display: 4,
    battery: 5,
    portability: 4,
    storage: 3,
    price: 4,
    reliability: 4,
    camera: 2,
  },
  'Programming & Development': {
    performance: 5,
    display: 4,
    storage: 5,
    battery: 4,
    portability: 3,
    price: 3,
    reliability: 4,
    camera: 1,
  },
  'Photography & Content Creation': {
    performance: 4,
    display: 5,
    camera: 5,
    storage: 5,
    battery: 3,
    portability: 3,
    price: 2,
    reliability: 4,
  },
  'Study & Everyday Use': {
    performance: 3,
    display: 3,
    battery: 4,
    portability: 4,
    storage: 3,
    price: 5,
    reliability: 4,
    camera: 2,
  },
  'Travel': {
    performance: 3,
    display: 3,
    battery: 5,
    portability: 5,
    storage: 3,
    price: 3,
    reliability: 4,
    camera: 3,
  },
  'General Entertainment': {
    performance: 3,
    display: 5,
    battery: 4,
    portability: 3,
    storage: 3,
    price: 4,
    reliability: 3,
    camera: 2,
  },
};

/**
 * Normalizes values between 0 and 1.
 * If higherIsBetter is false, inverts the normalization.
 */
function normalize(value, min, max, higherIsBetter = true) {
  if (value === null || value === undefined) return 0.35; // Missing info penalty
  if (max === min) return 0.8;
  const ratio = (value - min) / (max - min);
  const clamped = Math.max(0, Math.min(1, ratio));
  return higherIsBetter ? clamped : 1 - clamped;
}

/**
 * Extracts numeric or quality score for a spec dimension based on product category.
 */
function extractMetric(product, dimension) {
  const specs = product.specs || {};
  switch (dimension) {
    case 'performance':
      // Derived from RAM + Processor tier + GPU presence
      let score = (specs.ram || 0) * 1.5;
      if (specs.gpu) score += 15;
      if (specs.processor?.includes('i7') || specs.processor?.includes('i9') || specs.processor?.includes('Ryzen 7') || specs.processor?.includes('M3') || specs.processor?.includes('M2') || specs.processor?.includes('Snapdragon 8') || specs.processor?.includes('A17') || specs.processor?.includes('A18')) {
        score += 15;
      }
      return score > 0 ? score : null;

    case 'storage':
      return specs.storage || null;

    case 'battery':
      return specs.battery || specs.batteryLife || null;

    case 'display':
      let dispScore = (specs.refreshRate || 60);
      if (specs.displayType?.includes('OLED') || specs.displayType?.includes('AMOLED')) dispScore += 40;
      if (specs.resolution?.includes('4K') || specs.resolution?.includes('QHD')) dispScore += 20;
      return dispScore;

    case 'camera':
      return specs.cameraMain || null;

    case 'portability':
      // Lower weight is higher portability; default 2.0kg if laptop
      return specs.weight !== undefined ? specs.weight : null;

    case 'reliability':
      return product.rating || 3.5;

    case 'price':
      return product.price;

    default:
      return null;
  }
}

/**
 * Generates human-readable explanations, pros, and cons
 */
function generateExplanations(product, criteria, scoreBreakdown) {
  const reasons = [];
  const pros = [];
  const cons = [];
  const specs = product.specs || {};

  // Reason generation based on top score dimensions
  if (specs.ram && specs.ram >= 16) {
    reasons.push(`Equipped with ${specs.ram}GB RAM for lag-free performance in demanding workflows`);
    pros.push(`${specs.ram}GB RAM multitasking capability`);
  } else if (specs.ram && specs.ram >= 8) {
    pros.push(`${specs.ram}GB standard operational memory`);
  }

  if (specs.storage && specs.storage >= 512) {
    reasons.push(`Spacious ${specs.storage >= 1024 ? `${specs.storage / 1024}TB` : `${specs.storage}GB`} high-speed storage`);
    pros.push(`Generous storage capacity (${specs.storage}GB)`);
  }

  if (specs.refreshRate && specs.refreshRate >= 120) {
    reasons.push(`Smooth ${specs.refreshRate}Hz display matches your visual preference`);
    pros.push(`High refresh rate (${specs.refreshRate}Hz) panel`);
  }

  if (specs.batteryLife && specs.batteryLife >= 15) {
    reasons.push(`Exceptional ${specs.batteryLife}h battery endurance for all-day portability`);
    pros.push(`Long battery endurance (${specs.batteryLife} hours)`);
  } else if (specs.battery && specs.battery >= 5000) {
    reasons.push(`Robust 5000+ mAh battery for prolonged daily usage`);
    pros.push(`High-capacity ${specs.battery} mAh battery`);
  }

  if (specs.cameraMain && specs.cameraMain >= 50) {
    pros.push(`High-resolution ${specs.cameraMain}MP camera system`);
  }

  if (product.rating >= 4.7) {
    reasons.push(`Highly praised by verified buyers with an outstanding ${product.rating}★ rating`);
    pros.push(`Top-tier consumer satisfaction (${product.rating}★ over ${product.reviewCount || 1} reviews)`);
  }

  // Budget rationale
  if (criteria.budgetMax && product.price <= criteria.budgetMax * 0.75) {
    reasons.push(`Catalog price ₹${product.price}, well under your maximum budget of ₹${criteria.budgetMax}`);
    pros.push(`Catalog price ₹${(criteria.budgetMax - product.price).toFixed(0)} under maximum budget ceiling`);
  }

  // Realistic trade-offs / Cons
  if (specs.weight && specs.weight >= 2.2) {
    cons.push(`Substantial chassis weight (${specs.weight} kg) may reduce mobility`);
  }
  if (specs.refreshRate && specs.refreshRate <= 60) {
    cons.push('Standard 60Hz screen refresh rate');
  }
  if (criteria.budgetMax && product.price >= criteria.budgetMax * 0.95) {
    cons.push(`Price is situated near the upper boundary of your allocated budget`);
  }
  if (!specs.is5G && product.category === 'smartphones') {
    cons.push('Does not include 5G cellular connectivity');
  }
  if (specs.ram && specs.ram <= 4 && product.category === 'smartphones') {
    cons.push('Limited 4GB RAM may restrict heavy background apps');
  }

  if (reasons.length === 0) {
    reasons.push(`Balanced electronics package meeting your ${criteria.useCase || 'everyday'} criteria`);
  }
  if (pros.length === 0) {
    pros.push(`Solid build quality backed by ${product.warranty || 'warranty'}`);
  }
  if (cons.length === 0) {
    cons.push('No significant performance drawbacks reported');
  }

  return {
    reasons: reasons.slice(0, 3),
    pros: pros.slice(0, 3),
    cons: cons.slice(0, 2),
  };
}

/**
 * Main recommendation pipeline
 * @param {Array} allProducts - Catalog products to evaluate
 * @param {Object} criteria - User questionnaire selections
 * @returns {Object} { rankedProducts, totalMatches, relaxationAdvice }
 */
export function rankRecommendations(allProducts, criteria) {
  const {
    category,
    budgetMin = 0,
    budgetMax = 500000,
    useCase = 'Everyday',
    brands = [],
    specs = {},
    priorities = {},
    limit = 10,
  } = criteria;

  // 1. HARD FILTERING
  const hardFiltered = allProducts.filter(p => {
    // Recommendations and budget math require a usable numeric catalog price.
    if (!Number.isFinite(p.price) || p.price < 0) return false;
    // Category check
    if (category && p.category?.toLowerCase() !== category.toLowerCase()) {
      return false;
    }

    // Budget check
    if (p.price < budgetMin || p.price > budgetMax) {
      return false;
    }

    // Brand check (if specified and not "any")
    const validBrands = brands.filter(b => b && b.toLowerCase() !== 'any');
    if (validBrands.length > 0) {
      const matchBrand = validBrands.some(b => b.toLowerCase() === p.brand?.toLowerCase());
      if (!matchBrand) return false;
    }

    // Mandatory specs checks
    const pSpecs = p.specs || {};
    if (specs.minRam && (pSpecs.ram || 0) < specs.minRam) return false;
    if (specs.minStorage && (pSpecs.storage || 0) < specs.minStorage) return false;
    if (specs.minBatteryLife && (pSpecs.batteryLife || 0) < specs.minBatteryLife) return false;
    if (specs.minRefreshRate && (pSpecs.refreshRate || 0) < specs.minRefreshRate) return false;
    if (specs.required5G && !pSpecs.is5G) return false;
    if (specs.requiredAnc && !pSpecs.anc) return false;
    if (specs.os && pSpecs.os && !pSpecs.os.toLowerCase().includes(specs.os.toLowerCase())) return false;

    return true;
  });

  // Handle empty match states with smart relaxation advice
  if (hardFiltered.length === 0) {
    const categoryCount = allProducts.filter(p => p.category?.toLowerCase() === category?.toLowerCase()).length;
    const suggestions = [];

    if (categoryCount > 0) {
      suggestions.push(`Consider broadening your budget (e.g. increase max budget beyond ₹${budgetMax})`);
      if (brands.length > 0) {
        suggestions.push('Select "Any Brand" to explore alternatives from other reputable manufacturers');
      }
      if (specs.minRam || specs.minStorage || specs.required5G || specs.requiredAnc) {
        suggestions.push('Relax specific minimum specifications (such as RAM or storage requirements)');
      }
    } else {
      suggestions.push(`We currently have limited catalog items under the "${category}" category`);
    }

    return {
      success: true,
      rankedProducts: [],
      totalMatches: 0,
      relaxationAdvice: {
        message: 'No electronics matched all strict constraints.',
        suggestions,
      },
    };
  }

  // 2. FEATURE EXTREMES COMPUTATION FOR NORMALIZATION
  const dimensions = ['performance', 'storage', 'battery', 'display', 'camera', 'portability', 'reliability', 'price'];
  const extremes = {};

  dimensions.forEach(dim => {
    const higherIsBetter = dim !== 'portability'; // For portability, lower weight is better
    const values = hardFiltered
      .map(p => extractMetric(p, dim))
      .filter(v => v !== null && v !== undefined);

    if (values.length > 0) {
      extremes[dim] = {
        min: Math.min(...values),
        max: Math.max(...values),
        higherIsBetter,
      };
    } else {
      extremes[dim] = { min: 0, max: 1, higherIsBetter };
    }
  });

  // 3. WEIGHT PROFILE COMPUTATION
  const baseProfile = USE_CASE_PROFILES[useCase] || USE_CASE_PROFILES['Study & Everyday Use'];
  const rawWeights = {};
  let totalRawWeight = 0;

  dimensions.forEach(dim => {
    const baseW = baseProfile[dim] || 3;
    const userW = priorities[dim] !== undefined ? priorities[dim] : 3;
    const combinedW = baseW * (userW / 3);
    rawWeights[dim] = combinedW;
    totalRawWeight += combinedW;
  });

  // Normalized weights
  const weights = {};
  dimensions.forEach(dim => {
    weights[dim] = rawWeights[dim] / totalRawWeight;
  });

  // 4. SCORING CANDIDATES
  const scoredProducts = hardFiltered.map(product => {
    let specWeightedSum = 0;
    const normalizedBreakdown = {};

    dimensions.forEach(dim => {
      const rawVal = extractMetric(product, dim);
      const ext = extremes[dim];
      const norm = normalize(rawVal, ext.min, ext.max, ext.higherIsBetter);
      normalizedBreakdown[dim] = norm;
      specWeightedSum += norm * weights[dim];
    });

    // Value for money component
    const budgetSpan = Math.max(1, budgetMax - budgetMin);
    const priceEfficiency = 1 - Math.max(0, Math.min(1, (product.price - budgetMin) / budgetSpan));
    const valueScore = (specWeightedSum * 0.6) + (priceEfficiency * 0.4);

    // Customer satisfaction component (rating)
    const ratingScore = (product.rating || 3.5) / 5;

    // Brand affinity
    const brandPreferred = brands.length === 0 ||
      brands.includes('Any') ||
      brands.some(b => b.toLowerCase() === product.brand?.toLowerCase());
    const brandScore = brandPreferred ? 1.0 : 0.7;

    // Composite match percentage (0 to 100)
    const composite = (
      (0.50 * specWeightedSum) +
      (0.25 * valueScore) +
      (0.15 * ratingScore) +
      (0.10 * brandScore)
    );

    const matchScore = Math.min(99, Math.max(35, Math.round(composite * 100)));

    const explanations = generateExplanations(product, criteria, normalizedBreakdown);

    return {
      product,
      matchScore,
      valueScore: Math.round(valueScore * 100),
      reasons: explanations.reasons,
      pros: explanations.pros,
      cons: explanations.cons,
      scoreBreakdown: {
        specPerformance: Math.round(specWeightedSum * 100),
        valueForMoney: Math.round(valueScore * 100),
        userRating: Math.round(ratingScore * 100),
      },
    };
  });

  // 5. SORT BY MATCH SCORE DESCENDING
  scoredProducts.sort((a, b) => b.matchScore - a.matchScore);

  return {
    success: true,
    totalMatches: scoredProducts.length,
    rankedProducts: scoredProducts.slice(0, limit),
    relaxationAdvice: null,
  };
}
