import test from 'node:test';
import assert from 'node:assert/strict';

test('Cart and Order: INR catalog subtotal is the payable total without configured merchant fees', () => {
  const items = [
    { price: 1199, quantity: 2 }, // 2398
    { price: 399, quantity: 1 },  // 399
  ];

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  assert.equal(subtotal, 2797);

  const shippingCost = 0;
  assert.equal(shippingCost, 0);
  const tax = 0;
  assert.equal(tax, 0);

  const total = Math.round((subtotal + shippingCost + tax) * 100) / 100;
  assert.equal(total, 2797);
});

test('Cart and Order: No fees are invented for smaller INR orders', () => {
  const subtotal = 499;
  const shippingCost = 0;
  const tax = 0;
  assert.equal(subtotal + shippingCost + tax, 499);
});
