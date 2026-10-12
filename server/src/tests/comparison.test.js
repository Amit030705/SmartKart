import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeComparison } from '../services/comparisonEngine.js';

const mockPhones = [
  {
    _id: 'phone-1',
    name: 'Flagship Phone A',
    brand: 'BrandA',
    category: 'smartphones',
    price: 1199,
    rating: 4.9,
    reviewCount: 200,
    specs: { ram: 12, storage: 256, battery: 5000, refreshRate: 120 },
  },
  {
    _id: 'phone-2',
    name: 'Midrange Phone B',
    brand: 'BrandB',
    category: 'smartphones',
    price: 699,
    rating: 4.4,
    reviewCount: 80,
    specs: { ram: 8, storage: 128, battery: 4500, refreshRate: 90 },
  },
  {
    _id: 'phone-3',
    name: 'Budget Phone C',
    brand: 'BrandC',
    category: 'smartphones',
    price: 399,
    rating: 4.1,
    reviewCount: 50,
    specs: { ram: 6, storage: 128, battery: 5000, refreshRate: 60 },
  },
];

test('Comparison Engine: Validates 2 to 4 products constraint', () => {
  assert.throws(() => analyzeComparison([mockPhones[0]]), /at least 2 products/);
  assert.throws(
    () => analyzeComparison([...mockPhones, mockPhones[0], mockPhones[1]]),
    /maximum of 4 products/
  );
});

test('Comparison Engine: Rejects cross-category comparisons', () => {
  const crossCategory = [
    mockPhones[0],
    { _id: 'laptop-1', name: 'Laptop X', category: 'laptops', price: 999 },
  ];
  assert.throws(() => analyzeComparison(crossCategory), /same category/);
});

test('Comparison Engine: Identifies lowest price and highest rated correctly', () => {
  const result = analyzeComparison(mockPhones);
  assert.equal(result.highlights.lowestPriceId, 'phone-3'); // $399
  assert.equal(result.highlights.highestRatedId, 'phone-1'); // 4.9★
  assert.ok(result.highlights.bestValueId);
  assert.ok(result.summary.length > 0);
});

test('Comparison Engine: Highlights lowest sourced offer only within selected products', () => {
  const checkedAt = new Date('2026-10-12T18:00:00Z');
  const products = mockPhones.map((product, index) => ({
    ...product,
    observedPrice: [900, 650, undefined][index],
    priceVerifiedAt: index < 2 ? checkedAt : undefined,
    priceSource: index < 2 ? 'Retailer' : undefined,
    priceUrl: index < 2 ? 'https://retailer.example/item' : undefined,
  }));
  const result = analyzeComparison(products);
  assert.equal(result.highlights.lowestVerifiedPriceId, 'phone-2');
  assert.match(result.summary.join(' '), /Lowest verified retailer offer/);
});

test('Comparison Engine: Does not claim a verified offer when all offers are unverified', () => {
  assert.equal(analyzeComparison(mockPhones).highlights.lowestVerifiedPriceId, null);
});
