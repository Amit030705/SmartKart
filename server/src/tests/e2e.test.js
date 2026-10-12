import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../../server.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { seedDatabase } from '../seed/seed.js';

let server;
let baseUrl;

test.before(async () => {
  await connectDB();
  await seedDatabase();
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await disconnectDB();
});

test('E2E: Health Check API', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'online');
  assert.equal(data.appName, 'SmartCart API');
});

test('E2E: Product Catalog Listing & Search', async () => {
  const res = await fetch(`${baseUrl}/api/products?limit=5`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.products));
  assert.ok(data.products.length > 0);
});

test('E2E: Smart Recommendation Endpoint evaluates and ranks catalog', async () => {
  const payload = {
    category: 'laptops',
    budgetMin: 50000,
    budgetMax: 400000,
    useCase: 'Gaming',
    brands: ['Any'],
    priorities: {
      performance: 5,
      display: 5,
      battery: 2,
    },
  };

  const res = await fetch(`${baseUrl}/api/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.rankedProducts));
  assert.ok(data.rankedProducts.length > 0);

  // Validate explainable structure
  const first = data.rankedProducts[0];
  assert.ok(first.matchScore >= 0 && first.matchScore <= 100);
  assert.ok(first.reasons.length > 0);
  assert.ok(first.pros.length > 0);
});

test('E2E: Comparison Endpoint between 2 products', async () => {
  // First fetch 2 laptops
  const catRes = await fetch(`${baseUrl}/api/products?category=laptops&limit=2`);
  const catData = await catRes.json();
  assert.ok(catData.products.length >= 2);

  const productIds = [catData.products[0]._id, catData.products[1]._id];

  const compareRes = await fetch(`${baseUrl}/api/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productIds }),
  });

  assert.equal(compareRes.status, 200);
  const compareData = await compareRes.json();
  assert.equal(compareData.success, true);
  assert.ok(compareData.highlights.lowestPriceId);
  assert.ok(compareData.highlights.highestRatedId);
  assert.ok(compareData.highlights.bestValueId);
});

test('E2E: Login and checkout ignores client price and uses catalog INR price', async () => {
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alex@example.com', password: 'UserPassword123!' }),
  });
  assert.equal(loginRes.status, 200);
  const cookie = loginRes.headers.get('set-cookie')?.split(';')[0];
  assert.ok(cookie);

  const productsRes = await fetch(`${baseUrl}/api/products?limit=1`);
  const { products } = await productsRes.json();
  const product = products[0];
  const orderRes = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      shippingAddress: { street: '1 Test Road', city: 'Pune', state: 'Maharashtra', postalCode: '411001', country: 'India', phone: '+91 90000 00000' },
      items: [{ productId: product._id, quantity: 1, price: 1 }],
    }),
  });
  assert.equal(orderRes.status, 201);
  const { order } = await orderRes.json();
  assert.equal(order.items[0].price, product.price);
  assert.equal(order.pricing.subtotal, product.price);
  assert.equal(order.pricing.shippingCost, 0);
  assert.equal(order.pricing.tax, 0);
});

test('E2E: Admin route unauthorized without credentials', async () => {
  const res = await fetch(`${baseUrl}/api/admin/dashboard`);
  assert.equal(res.status, 401);
});
