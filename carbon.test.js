/**
 * @file carbon.test.js
 * Comprehensive unit tests for all utility modules.
 * Run with: node --test carbon.test.js
 */

import { strict as assert } from 'assert';
import { describe, test, beforeEach } from 'node:test';

import {
  calculateFootprint,
  compareToAverage,
  getHighestImpactCategory,
  formatCO2,
  calculateStreak,
  calculateTrend,
} from './frontend/src/utils/carbon.js';

import {
  validateKm,
  validateMeals,
  validateEnergy,
  validatePurchases,
} from './frontend/src/utils/validation.js';

import {
  MAX_KM_INPUT,
  MAX_MEALS_INPUT,
  MAX_KWH_INPUT,
  MAX_PURCHASES_INPUT,
  KG_CO2_PER_KM_CAR,
  KG_CO2_PER_KWH_MAP,
  KG_CO2_PER_ONLINE_PURCHASE,
  KG_CO2_PER_VEGAN_MEAL,
  INDIA_AVERAGE_ANNUAL_KG,
} from './frontend/src/utils/constants.js';

// ============================================================================
// calculateFootprint
// ============================================================================
describe('calculateFootprint', () => {
  test('car travel produces correct transport CO2', () => {
    const { breakdown } = calculateFootprint({ transportKm: 100, transportMode: 'car' });
    assert.strictEqual(Number(breakdown.transport.toFixed(2)), 100 * KG_CO2_PER_KM_CAR);
  });

  test('bike produces zero transport CO2', () => {
    const { breakdown } = calculateFootprint({ transportKm: 100, transportMode: 'bike' });
    assert.strictEqual(breakdown.transport, 0);
  });

  test('bus produces less CO2 than car for same distance', () => {
    const car = calculateFootprint({ transportKm: 100, transportMode: 'car' });
    const bus = calculateFootprint({ transportKm: 100, transportMode: 'bus' });
    assert.ok(bus.breakdown.transport < car.breakdown.transport);
  });

  test('train produces less CO2 than bus for same distance', () => {
    const bus = calculateFootprint({ transportKm: 100, transportMode: 'bus' });
    const train = calculateFootprint({ transportKm: 100, transportMode: 'train' });
    assert.ok(train.breakdown.transport < bus.breakdown.transport);
  });

  test('vegan diet produces lower CO2 than omnivore', () => {
    const vegan = calculateFootprint({ dietType: 'vegan', meatMeals: 0 });
    const omnivore = calculateFootprint({ dietType: 'omnivore', meatMeals: 7 });
    assert.ok(vegan.breakdown.diet < omnivore.breakdown.diet);
  });

  test('vegetarian diet falls between vegan and omnivore', () => {
    const vegan = calculateFootprint({ dietType: 'vegan' });
    const veg = calculateFootprint({ dietType: 'vegetarian' });
    const omni = calculateFootprint({ dietType: 'omnivore', meatMeals: 7 });
    assert.ok(vegan.breakdown.diet < veg.breakdown.diet);
    assert.ok(veg.breakdown.diet < omni.breakdown.diet);
  });

  test('energy calculation uses correct constant', () => {
    const { breakdown } = calculateFootprint({ energyKwh: 10 });
    assert.strictEqual(Number(breakdown.energy.toFixed(2)), Number((10 * KG_CO2_PER_KWH_MAP['Other']).toFixed(2)));
  });

  test('shopping calculation uses correct constant', () => {
    const { breakdown } = calculateFootprint({ purchases: 3 });
    assert.strictEqual(breakdown.shopping, 3 * KG_CO2_PER_ONLINE_PURCHASE);
  });

  test('zero inputs produce zero CO2 for vegan', () => {
    const { breakdown } = calculateFootprint({ transportKm: 0, purchases: 0, energyKwh: 0, dietType: 'vegan' });
    assert.strictEqual(breakdown.transport, 0);
    assert.strictEqual(breakdown.shopping, 0);
    assert.strictEqual(breakdown.energy, 0);
  });

  test('total equals sum of all breakdown categories', () => {
    const inputs = { transportKm: 50, transportMode: 'car', meatMeals: 3, dietType: 'omnivore', energyKwh: 100, purchases: 2 };
    const { total, breakdown } = calculateFootprint(inputs);
    const summed = breakdown.transport + breakdown.diet + breakdown.energy + breakdown.shopping;
    assert.strictEqual(Number(total.toFixed(5)), Number(summed.toFixed(5)));
  });

  test('handles missing inputs gracefully with defaults', () => {
    assert.doesNotThrow(() => calculateFootprint({}));
    const { total } = calculateFootprint({});
    assert.ok(typeof total === 'number');
  });

  test('handles undefined transportMode by defaulting to bike (zero)', () => {
    const { breakdown } = calculateFootprint({ transportKm: 50, transportMode: 'unknown' });
    assert.strictEqual(breakdown.transport, 0);
  });
});

// ============================================================================
// getHighestImpactCategory
// ============================================================================
describe('getHighestImpactCategory', () => {
  test('identifies diet as highest', () => {
    assert.strictEqual(getHighestImpactCategory({ transport: 1, diet: 9, energy: 2, shopping: 3 }), 'diet');
  });

  test('identifies transport as highest', () => {
    assert.strictEqual(getHighestImpactCategory({ transport: 10, diet: 2, energy: 1, shopping: 1 }), 'transport');
  });

  test('identifies energy as highest', () => {
    assert.strictEqual(getHighestImpactCategory({ transport: 1, diet: 2, energy: 15, shopping: 3 }), 'energy');
  });

  test('identifies shopping as highest', () => {
    assert.strictEqual(getHighestImpactCategory({ transport: 1, diet: 2, energy: 3, shopping: 20 }), 'shopping');
  });

  test('handles equal values without throwing', () => {
    const result = getHighestImpactCategory({ transport: 5, diet: 5, energy: 5, shopping: 5 });
    assert.ok(['transport', 'diet', 'energy', 'shopping'].includes(result));
  });

  test('handles all zeros', () => {
    const result = getHighestImpactCategory({ transport: 0, diet: 0, energy: 0, shopping: 0 });
    assert.ok(typeof result === 'string');
  });
});

// ============================================================================
// compareToAverage
// ============================================================================
describe('compareToAverage', () => {
  test('high footprint yields High percentile', () => {
    assert.strictEqual(compareToAverage(100).percentile, 'High');
  });

  test('low footprint yields Low percentile', () => {
    assert.strictEqual(compareToAverage(5).percentile, 'Low');
  });

  test('average footprint yields Average percentile', () => {
    const weeklyAvg = INDIA_AVERAGE_ANNUAL_KG / 52;
    assert.strictEqual(compareToAverage(weeklyAvg).percentile, 'Average');
  });

  test('returns vsIndia and vsWorld as numbers', () => {
    const result = compareToAverage(40);
    assert.ok(typeof result.vsIndia === 'number');
    assert.ok(typeof result.vsWorld === 'number');
  });

  test('vsIndia is greater than vsWorld for same input', () => {
    const result = compareToAverage(40);
    assert.ok(result.vsIndia > result.vsWorld, 'India avg is lower than world avg');
  });

  test('zero footprint returns Low percentile', () => {
    assert.strictEqual(compareToAverage(0).percentile, 'Low');
  });
});

// ============================================================================
// formatCO2
// ============================================================================
describe('formatCO2', () => {
  test('formats number to one decimal with unit', () => {
    assert.strictEqual(formatCO2(12.345), '12.3 kg CO₂');
  });

  test('formats zero correctly', () => {
    assert.strictEqual(formatCO2(0), '0.0 kg CO₂');
  });

  test('handles string number input', () => {
    assert.strictEqual(formatCO2('5.678'), '5.7 kg CO₂');
  });

  test('rounds correctly', () => {
    assert.strictEqual(formatCO2(9.96), '10.0 kg CO₂');
  });

  test('handles large numbers', () => {
    assert.strictEqual(formatCO2(1234.5), '1234.5 kg CO₂');
  });
});

// ============================================================================
// calculateTrend
// ============================================================================
describe('calculateTrend', () => {
  test('returns 0 for empty history', () => {
    assert.strictEqual(calculateTrend([]), 0);
  });

  test('returns 0 for null input', () => {
    assert.strictEqual(calculateTrend(null), 0);
  });

  test('returns 0 for single entry', () => {
    assert.strictEqual(calculateTrend([{ date: new Date().toISOString(), total: 10 }]), 0);
  });

  test('returns negative percentage when improved', () => {
    const entries = [
      { date: new Date(Date.now() - 86400000).toISOString(), total: 10 },
      { date: new Date().toISOString(), total: 8 },
    ];
    assert.ok(calculateTrend(entries) < 0);
  });

  test('returns positive percentage when worsened', () => {
    const entries = [
      { date: new Date(Date.now() - 86400000).toISOString(), total: 8 },
      { date: new Date().toISOString(), total: 10 },
    ];
    assert.ok(calculateTrend(entries) > 0);
  });

  test('returns correct percentage value', () => {
    const entries = [
      { date: new Date(Date.now() - 86400000).toISOString(), total: 10 },
      { date: new Date().toISOString(), total: 12 },
    ];
    const trend = calculateTrend(entries);
    assert.strictEqual(trend, 20); // (12-10)/10 * 100
  });

  test('handles previous total of zero without crashing', () => {
    const entries = [
      { date: new Date(Date.now() - 86400000).toISOString(), total: 0 },
      { date: new Date().toISOString(), total: 5 },
    ];
    assert.doesNotThrow(() => calculateTrend(entries));
  });

  test('returns 0 when both entries are zero', () => {
    const entries = [
      { date: new Date(Date.now() - 86400000).toISOString(), total: 0 },
      { date: new Date().toISOString(), total: 0 },
    ];
    assert.strictEqual(calculateTrend(entries), 0);
  });
});

// ============================================================================
// calculateStreak
// ============================================================================
describe('calculateStreak', () => {
  test('returns 0 for empty history', () => {
    assert.strictEqual(calculateStreak([]), 0);
  });

  test('returns 0 for null input', () => {
    assert.strictEqual(calculateStreak(null), 0);
  });

  test('returns 0 for undefined input', () => {
    assert.strictEqual(calculateStreak(undefined), 0);
  });

  test('returns 1 for a single entry today', () => {
    const entries = [{ date: new Date().toISOString(), total: 5 }];
    assert.strictEqual(calculateStreak(entries), 1);
  });

  test('returns 0 for entry from a week ago', () => {
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    assert.strictEqual(calculateStreak([{ date: weekAgo, total: 5 }]), 0);
  });
});

// ============================================================================
// validateKm
// ============================================================================
describe('validateKm', () => {
  test('rejects empty string', () => {
    assert.strictEqual(validateKm('').valid, false);
  });

  test('rejects null', () => {
    assert.strictEqual(validateKm(null).valid, false);
  });

  test('rejects undefined', () => {
    assert.strictEqual(validateKm(undefined).valid, false);
  });

  test('rejects NaN string', () => {
    assert.strictEqual(validateKm('abc').valid, false);
  });

  test('rejects negative number', () => {
    assert.strictEqual(validateKm(-1).valid, false);
  });

  test('rejects value above MAX_KM_INPUT', () => {
    assert.strictEqual(validateKm(MAX_KM_INPUT + 1).valid, false);
  });

  test('accepts zero', () => {
    assert.strictEqual(validateKm(0).valid, true);
  });

  test('accepts valid positive number', () => {
    assert.strictEqual(validateKm(50).valid, true);
  });

  test('accepts MAX_KM_INPUT exactly', () => {
    assert.strictEqual(validateKm(MAX_KM_INPUT).valid, true);
  });

  test('returns error message for invalid input', () => {
    const result = validateKm('');
    assert.ok(result.error !== null);
    assert.ok(typeof result.error === 'string');
  });

  test('returns null error for valid input', () => {
    assert.strictEqual(validateKm(10).error, null);
  });
});

// ============================================================================
// validateMeals
// ============================================================================
describe('validateMeals', () => {
  test('rejects empty string', () => {
    assert.strictEqual(validateMeals('').valid, false);
  });

  test('rejects negative number', () => {
    assert.strictEqual(validateMeals(-1).valid, false);
  });

  test('rejects value above MAX_MEALS_INPUT', () => {
    assert.strictEqual(validateMeals(MAX_MEALS_INPUT + 1).valid, false);
  });

  test('accepts zero', () => {
    assert.strictEqual(validateMeals(0).valid, true);
  });

  test('accepts valid number within range', () => {
    assert.strictEqual(validateMeals(7).valid, true);
  });

  test('accepts MAX_MEALS_INPUT exactly', () => {
    assert.strictEqual(validateMeals(MAX_MEALS_INPUT).valid, true);
  });
});

// ============================================================================
// validateEnergy
// ============================================================================
describe('validateEnergy', () => {
  test('rejects empty string', () => {
    assert.strictEqual(validateEnergy('').valid, false);
  });

  test('rejects negative number', () => {
    assert.strictEqual(validateEnergy(-5).valid, false);
  });

  test('rejects value above MAX_KWH_INPUT', () => {
    assert.strictEqual(validateEnergy(MAX_KWH_INPUT + 1).valid, false);
  });

  test('accepts zero', () => {
    assert.strictEqual(validateEnergy(0).valid, true);
  });

  test('accepts valid positive number', () => {
    assert.strictEqual(validateEnergy(200).valid, true);
  });

  test('accepts MAX_KWH_INPUT exactly', () => {
    assert.strictEqual(validateEnergy(MAX_KWH_INPUT).valid, true);
  });
});

// ============================================================================
// validatePurchases
// ============================================================================
describe('validatePurchases', () => {
  test('rejects empty string', () => {
    assert.strictEqual(validatePurchases('').valid, false);
  });

  test('rejects negative number', () => {
    assert.strictEqual(validatePurchases(-1).valid, false);
  });

  test('rejects value above MAX_PURCHASES_INPUT', () => {
    assert.strictEqual(validatePurchases(MAX_PURCHASES_INPUT + 1).valid, false);
  });

  test('accepts zero', () => {
    assert.strictEqual(validatePurchases(0).valid, true);
  });

  test('accepts valid number', () => {
    assert.strictEqual(validatePurchases(5).valid, true);
  });

  test('accepts MAX_PURCHASES_INPUT exactly', () => {
    assert.strictEqual(validatePurchases(MAX_PURCHASES_INPUT).valid, true);
  });

  test('rejects NaN string', () => {
    assert.strictEqual(validatePurchases('xyz').valid, false);
  });
});

// ============================================================================
// Integration: end-to-end data flow
// ============================================================================
describe('Integration: full data pipeline', () => {
  test('inputs → calculateFootprint → getHighestImpact → formatCO2', () => {
    const inputs = { transportKm: 100, transportMode: 'car', meatMeals: 5, dietType: 'omnivore', energyKwh: 50, purchases: 3 };
    const { total, breakdown } = calculateFootprint(inputs);
    const highest = getHighestImpactCategory(breakdown);
    const formatted = formatCO2(total);

    assert.ok(total > 0);
    assert.ok(['transport', 'diet', 'energy', 'shopping'].includes(highest));
    assert.ok(formatted.endsWith('kg CO₂'));
  });

  test('footprint feeds into compareToAverage correctly', () => {
    const { total } = calculateFootprint({ transportKm: 100, transportMode: 'car', energyKwh: 200, purchases: 5 });
    const comparison = compareToAverage(total);
    assert.ok(typeof comparison.percentile === 'string');
    assert.ok(typeof comparison.vsIndia === 'number');
  });

  test('all validation functions return consistent shape', () => {
    const validators = [validateKm, validateMeals, validateEnergy, validatePurchases];
    for (const validate of validators) {
      const valid = validate(5);
      assert.ok('valid' in valid);
      assert.ok('error' in valid);
      assert.strictEqual(valid.valid, true);
      assert.strictEqual(valid.error, null);

      const invalid = validate('');
      assert.strictEqual(invalid.valid, false);
      assert.ok(typeof invalid.error === 'string');
    }
  });
});
