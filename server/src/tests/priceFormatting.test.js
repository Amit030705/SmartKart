import test from 'node:test';
import assert from 'node:assert/strict';
import { formatCurrency } from '../../../client/src/utils/formatters.js';

test('Price formatting uses Indian rupee currency and grouping', () => {
  assert.match(formatCurrency(123456), /₹1,23,456/);
  assert.equal(formatCurrency(null), '₹0');
});
