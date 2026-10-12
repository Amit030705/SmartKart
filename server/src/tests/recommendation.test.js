import test from 'node:test';
import assert from 'node:assert/strict';
import { rankRecommendations } from '../services/recommendationEngine.js';

const mockCatalog = [
  {
    _id: 'prod-laptop-1',
    name: 'Pro Laptop Ultra',
    brand: 'Apple',
    category: 'laptops',
    price: 1999,
    rating: 4.9,
    reviewCount: 45,
    specs: {
      ram: 32,
      storage: 1024,
      batteryLife: 18,
      refreshRate: 120,
      weight: 1.6,
      processor: 'Apple M3 Pro',
    },
  },
  {
    _id: 'prod-laptop-2',
    name: 'Budget Work Laptop',
    brand: 'Dell',
    category: 'laptops',
    price: 799,
    rating: 4.2,
    reviewCount: 20,
    specs: {
      ram: 8,
      storage: 256,
      batteryLife: 8,
      refreshRate: 60,
      weight: 2.1,
      processor: 'Intel Core i5',
    },
  },
  {
    _id: 'prod-laptop-3',
    name: 'Hardcore Gaming Rig',
    brand: 'Lenovo',
    category: 'laptops',
    price: 2499,
    rating: 4.7,
    reviewCount: 88,
    specs: {
      ram: 32,
      storage: 1024,
      batteryLife: 5,
      refreshRate: 240,
      weight: 2.8,
      gpu: 'RTX 4080',
      processor: 'Intel Core i9',
    },
  },
  {
    _id: 'prod-phone-1',
    name: 'Ultra Phone X',
    brand: 'Samsung',
    category: 'smartphones',
    price: 1199,
    rating: 4.8,
    reviewCount: 110,
    specs: {
      ram: 12,
      storage: 512,
      battery: 5000,
      refreshRate: 120,
      is5G: true,
      cameraMain: 200,
    },
  },
];

test('Recommendation Engine: Hard Constraints - Category and Budget Filtering', () => {
  const result = rankRecommendations(mockCatalog, {
    category: 'laptops',
    budgetMin: 500,
    budgetMax: 2000,
    useCase: 'Office & Productivity',
  });

  assert.equal(result.success, true);
  // prod-laptop-3 ($2499) and prod-phone-1 (smartphones) must be excluded
  assert.equal(result.rankedProducts.length, 2);
  const ids = result.rankedProducts.map(r => r.product._id);
  assert.ok(ids.includes('prod-laptop-1'));
  assert.ok(ids.includes('prod-laptop-2'));
  assert.ok(!ids.includes('prod-laptop-3'));
  assert.ok(!ids.includes('prod-phone-1'));
});

test('Recommendation Engine: Mandatory Spec Filtering (minRam and minRefreshRate)', () => {
  const result = rankRecommendations(mockCatalog, {
    category: 'laptops',
    budgetMin: 500,
    budgetMax: 3000,
    specs: {
      minRam: 16,
      minRefreshRate: 120,
    },
  });

  assert.equal(result.success, true);
  // Only prod-laptop-1 and prod-laptop-3 have ram >= 16 and refreshRate >= 120
  assert.equal(result.rankedProducts.length, 2);
  const ids = result.rankedProducts.map(r => r.product._id);
  assert.ok(ids.includes('prod-laptop-1'));
  assert.ok(ids.includes('prod-laptop-3'));
  assert.ok(!ids.includes('prod-laptop-2'));
});

test('Recommendation Engine: Priority Weighting Modulates Match Score', () => {
  // Test 1: Heavy Portability & Battery Priority
  const travelResult = rankRecommendations(mockCatalog, {
    category: 'laptops',
    budgetMin: 500,
    budgetMax: 3000,
    useCase: 'Travel',
    priorities: {
      battery: 5,
      portability: 5,
      performance: 1,
    },
  });

  // Test 2: Heavy Gaming & Extreme Performance Priority
  const gamingResult = rankRecommendations(mockCatalog, {
    category: 'laptops',
    budgetMin: 500,
    budgetMax: 3000,
    useCase: 'Gaming',
    priorities: {
      performance: 5,
      display: 5,
      battery: 1,
      portability: 1,
    },
  });

  // In travel, Apple (battery 18h, weight 1.6kg) should easily outrank Lenovo (battery 5h, weight 2.8kg)
  assert.equal(travelResult.rankedProducts[0].product._id, 'prod-laptop-1');

  // In gaming, the high-refresh RTX 4080 Lenovo should score higher than in travel
  const gamingLenovoRank = gamingResult.rankedProducts.find(r => r.product._id === 'prod-laptop-3');
  const travelLenovoRank = travelResult.rankedProducts.find(r => r.product._id === 'prod-laptop-3');
  assert.ok(gamingLenovoRank.matchScore > travelLenovoRank.matchScore);
});

test('Recommendation Engine: Match Score Range and Explainability Pros & Cons', () => {
  const result = rankRecommendations(mockCatalog, {
    category: 'laptops',
    budgetMin: 500,
    budgetMax: 3000,
    useCase: 'Programming & Development',
  });

  assert.ok(result.rankedProducts.length > 0);
  result.rankedProducts.forEach(item => {
    // Score must be an integer between 0 and 100
    assert.ok(item.matchScore >= 0 && item.matchScore <= 100);
    // Must contain explainable reasons, pros, and cons
    assert.ok(Array.isArray(item.reasons));
    assert.ok(item.reasons.length > 0);
    assert.ok(Array.isArray(item.pros));
    assert.ok(item.pros.length > 0);
    assert.ok(Array.isArray(item.cons));
  });
});

test('Recommendation Engine: Empty Results Produce Helpful Relaxation Advice', () => {
  const result = rankRecommendations(mockCatalog, {
    category: 'laptops',
    budgetMin: 100,
    budgetMax: 400, // No laptops exist in $100-$400 range
  });

  assert.equal(result.totalMatches, 0);
  assert.equal(result.rankedProducts.length, 0);
  assert.ok(result.relaxationAdvice !== null);
  assert.ok(result.relaxationAdvice.suggestions.length > 0);
});

test('Recommendation Engine: Excludes products without a usable catalog price', () => {
  const result = rankRecommendations([
    { ...mockCatalog[0], price: undefined },
    { ...mockCatalog[1], price: Number.NaN },
  ], { category: 'laptops', budgetMin: 0, budgetMax: 1000000 });
  assert.equal(result.totalMatches, 0);
});
