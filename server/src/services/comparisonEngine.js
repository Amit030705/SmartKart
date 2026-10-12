/**
 * SmartCart Multi-Product Comparison Engine
 * Computes comparative highlights, value scores, and side-by-side spec analysis.
 */

export function analyzeComparison(products) {
  if (!products || products.length < 2) {
    throw new Error('Comparison requires at least 2 products');
  }
  if (products.length > 4) {
    throw new Error('Comparison is limited to a maximum of 4 products');
  }

  // Verify all products belong to the same category
  const categories = new Set(products.map(p => p.category?.toLowerCase()));
  if (categories.size > 1) {
    throw new Error('Products must belong to the same category to ensure valid side-by-side comparison');
  }

  // 1. Identify Lowest Price
  let lowestPriceProduct = products[0];
  let highestRatedProduct = products[0];

  products.forEach(p => {
    if (p.price < lowestPriceProduct.price) {
      lowestPriceProduct = p;
    }
    if ((p.rating || 0) > (highestRatedProduct.rating || 0)) {
      highestRatedProduct = p;
    } else if (p.rating === highestRatedProduct.rating && (p.reviewCount || 0) > (highestRatedProduct.reviewCount || 0)) {
      highestRatedProduct = p;
    }
  });

  // 2. Best Value Computation
  // Value Formula: ((SpecAggregateScore * 0.6 + (Rating / 5) * 0.4) / Price) * 1000
  // Compute normalized spec aggregate for candidate products
  const maxPrice = Math.max(...products.map(p => p.price));
  const minPrice = Math.min(...products.map(p => p.price));

  const scoredCandidates = products.map(p => {
    const specs = p.specs || {};
    let specPoints = 0;
    let specCount = 0;

    // Check relevant numerical specs
    if (specs.ram) {
      specPoints += Math.min(1, specs.ram / 32);
      specCount++;
    }
    if (specs.storage) {
      specPoints += Math.min(1, specs.storage / 1024);
      specCount++;
    }
    if (specs.batteryLife || specs.battery) {
      const bVal = specs.batteryLife || (specs.battery / 500);
      specPoints += Math.min(1, bVal / 20);
      specCount++;
    }
    if (specs.refreshRate) {
      specPoints += Math.min(1, specs.refreshRate / 144);
      specCount++;
    }

    const normSpecs = specCount > 0 ? (specPoints / specCount) : 0.5;
    const normRating = (p.rating || 3.5) / 5;
    const qualityScore = (normSpecs * 0.6) + (normRating * 0.4);

    // Value ratio scaled
    const rawValueRatio = (qualityScore / (p.price || 1)) * 1000;

    return {
      productId: p._id.toString(),
      qualityScore: Math.round(qualityScore * 100),
      valueRatio: rawValueRatio,
    };
  });

  // Find best value product
  scoredCandidates.sort((a, b) => b.valueRatio - a.valueRatio);
  const bestValueProduct = products.find(p => p._id.toString() === scoredCandidates[0].productId);
  const summaryBullets = [];
  const verifiedOffers = products.filter(p => Number.isFinite(p.observedPrice) && p.priceVerifiedAt && p.priceSource && p.priceUrl);
  const lowestVerifiedOffer = verifiedOffers.length
    ? verifiedOffers.reduce((lowest, product) => product.observedPrice < lowest.observedPrice ? product : lowest)
    : null;
  if (lowestVerifiedOffer) {
    summaryBullets.push(`Lowest verified retailer offer among these selected products: ₹${lowestVerifiedOffer.observedPrice} for ${lowestVerifiedOffer.name}, checked ${new Date(lowestVerifiedOffer.priceVerifiedAt).toLocaleDateString('en-IN')}.`);
  }

  // 3. Difference summary generation
  const priceSpread = maxPrice - minPrice;
  if (priceSpread > 0) {
    summaryBullets.push(
      `Catalog prices range from ₹${minPrice} (${lowestPriceProduct.name}) to ₹${maxPrice}, a delta of ₹${priceSpread.toFixed(0)}.`
    );
  }

  if (bestValueProduct._id.toString() !== lowestPriceProduct._id.toString()) {
    summaryBullets.push(
      `"${bestValueProduct.name}" provides the highest feature-to-price ratio despite not being the lowest priced.`
    );
  } else {
    summaryBullets.push(
      `"${lowestPriceProduct.name}" represents both the most affordable entry and leading value index.`
    );
  }

  if (highestRatedProduct.rating >= 4.5) {
    summaryBullets.push(
      `"${highestRatedProduct.name}" commands the strongest verified customer satisfaction rating at ${highestRatedProduct.rating}★.`
    );
  }

  // Spec specific observations
  const rams = products.map(p => ({ name: p.name, ram: p.specs?.ram })).filter(x => x.ram);
  if (rams.length >= 2) {
    const maxRam = Math.max(...rams.map(r => r.ram));
    const minRam = Math.min(...rams.map(r => r.ram));
    if (maxRam > minRam) {
      const topRamProd = rams.find(r => r.ram === maxRam);
      summaryBullets.push(`Memory advantage: ${topRamProd.name} offers ${maxRam}GB RAM vs ${minRam}GB baseline.`);
    }
  }

  return {
    highlights: {
      lowestPriceId: lowestPriceProduct._id.toString(),
      lowestVerifiedPriceId: lowestVerifiedOffer?._id.toString() || null,
      highestRatedId: highestRatedProduct._id.toString(),
      bestValueId: bestValueProduct._id.toString(),
    },
    valueScores: scoredCandidates,
    summary: summaryBullets,
  };
}
