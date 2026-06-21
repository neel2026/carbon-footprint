/**
 * @file carbon.test.js
 * Unit tests for carbon footprint utility functions.
 * Run with: node --test carbon.test.js
 */

import { strict as assert } from 'assert';
import { test } from 'node:test';

import {
  calculateFootprint,
  compareToAverage,
  getHighestImpactCategory,
  formatCO2,
  calculateStreak,
  calculateTrend,
} from './frontend/src/utils/carbon.js';

// ---------------------------------------------------------------------------
// calculateFootprint
// ---------------------------------------------------------------------------

test('calculateFootprint: car travel produces correct transport CO2', () => {
  const { breakdown } = calculateFootprint({ transportKm: 100, transportMode: 'car' });
  assert.ok(breakdown.transport > 0, 'transport CO2 should be positive');
  assert.strictEqual(Number(breakdown.transport.toFixed(2)), 21.00);
});

test('calculateFootprint: bike produces zero transport CO2', () => {
  const { breakdown } = calculateFootprint({ transportKm: 100, transportMode: 'bike' });
  assert.strictEqual(breakdown.transport, 0);
});

test('calculateFootprint: vegan diet produces lower CO2 than omnivore', () => {
  const vegan = calculateFootprint({ dietType: 'vegan', meatMeals: 0 });
  const omnivore = calculateFootprint({ dietType: 'omnivore', meatMeals: 7 });
  assert.ok(vegan.breakdown.diet < omnivore.breakdown.diet);
});

test('calculateFootprint: zero km and zero purchases contribute no transport/shopping CO2', () => {
  const { breakdown } = calculateFootprint({ transportKm: 0, transportMode: 'car', purchases: 0, energyKwh: 0, dietType: 'vegan' });
  assert.strictEqual(breakdown.transport, 0);
  assert.strictEqual(breakdown.shopping, 0);
  assert.strictEqual(breakdown.energy, 0);
});

test('calculateFootprint: total equals sum of breakdown categories', () => {
  const inputs = { transportKm: 50, transportMode: 'car', meatMeals: 3, dietType: 'omnivore', energyKwh: 100, purchases: 2 };
  const { total, breakdown } = calculateFootprint(inputs);
  const summed = breakdown.transport + breakdown.diet + breakdown.energy + breakdown.shopping;
  assert.strictEqual(Number(total.toFixed(5)), Number(summed.toFixed(5)));
});

// ---------------------------------------------------------------------------
// getHighestImpactCategory
// ---------------------------------------------------------------------------

test('getHighestImpactCategory: correctly identifies diet as highest', () => {
  const result = getHighestImpactCategory({ transport: 1, diet: 9, energy: 2, shopping: 3 });
  assert.strictEqual(result, 'diet');
});

test('getHighestImpactCategory: correctly identifies transport as highest', () => {
  const result = getHighestImpactCategory({ transport: 10, diet: 2, energy: 1, shopping: 1 });
  assert.strictEqual(result, 'transport');
});

test('getHighestImpactCategory: handles equal values without throwing', () => {
  const result = getHighestImpactCategory({ transport: 5, diet: 5, energy: 5, shopping: 5 });
  assert.ok(['transport', 'diet', 'energy', 'shopping'].includes(result));
});

// ---------------------------------------------------------------------------
// compareToAverage
// ---------------------------------------------------------------------------

test('compareToAverage: high footprint yields High percentile', () => {
  const { percentile } = compareToAverage(100); // 5200 kg/year
  assert.strictEqual(percentile, 'High');
});

test('compareToAverage: low footprint yields Low percentile', () => {
  const { percentile } = compareToAverage(5); // 260 kg/year
  assert.strictEqual(percentile, 'Low');
});

test('compareToAverage: returns vsIndia and vsWorld ratios', () => {
  const result = compareToAverage(40);
  assert.ok(typeof result.vsIndia === 'number');
  assert.ok(typeof result.vsWorld === 'number');
});

// ---------------------------------------------------------------------------
// formatCO2
// ---------------------------------------------------------------------------

test('formatCO2: formats a number to one decimal with unit', () => {
  assert.strictEqual(formatCO2(12.345), '12.3 kg CO₂');
});

test('formatCO2: formats zero correctly', () => {
  assert.strictEqual(formatCO2(0), '0.0 kg CO₂');
});

test('formatCO2: handles string number input', () => {
  assert.strictEqual(formatCO2('5.678'), '5.7 kg CO₂');
});

// ---------------------------------------------------------------------------
// calculateTrend
// ---------------------------------------------------------------------------

test('calculateTrend: returns 0 for empty history', () => {
  assert.strictEqual(calculateTrend([]), 0);
});

test('calculateTrend: returns 0 for single entry', () => {
  assert.strictEqual(calculateTrend([{ date: new Date().toISOString(), total: 10 }]), 0);
});

test('calculateTrend: returns negative percentage when improved', () => {
  const entries = [
    { date: new Date(Date.now() - 86400000).toISOString(), total: 10 },
    { date: new Date().toISOString(), total: 8 },
  ];
  const trend = calculateTrend(entries);
  assert.ok(trend < 0, 'Trend should be negative when footprint decreased');
});

test('calculateTrend: returns positive percentage when worsened', () => {
  const entries = [
    { date: new Date(Date.now() - 86400000).toISOString(), total: 8 },
    { date: new Date().toISOString(), total: 10 },
  ];
  const trend = calculateTrend(entries);
  assert.ok(trend > 0, 'Trend should be positive when footprint increased');
});

test('calculateTrend: handles previous total of zero without crashing', () => {
  const entries = [
    { date: new Date(Date.now() - 86400000).toISOString(), total: 0 },
    { date: new Date().toISOString(), total: 5 },
  ];
  assert.doesNotThrow(() => calculateTrend(entries));
});

// ---------------------------------------------------------------------------
// calculateStreak
// ---------------------------------------------------------------------------

test('calculateStreak: returns 0 for empty history', () => {
  assert.strictEqual(calculateStreak([]), 0);
});

test('calculateStreak: returns 0 for null input', () => {
  assert.strictEqual(calculateStreak(null), 0);
});

test('calculateStreak: returns 1 for a single entry today', () => {
  const entries = [{ date: new Date().toISOString(), total: 5 }];
  assert.strictEqual(calculateStreak(entries), 1);
});
