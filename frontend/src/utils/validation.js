import {
  MAX_KM_INPUT,
  MAX_MEALS_INPUT,
  MAX_KWH_INPUT
} from './constants.js';

/**
 * Validate kilometer input
 * @param {number|string} km
 * @returns {{ valid: boolean, error: string|null }}
 */
export const validateKm = (km) => {
  if (km === undefined || km === null || km === '') return { valid: false, error: 'This field is required' };
  const num = Number(km);
  if (isNaN(num)) return { valid: false, error: 'Please enter a number' };
  if (num < 0) return { valid: false, error: 'Must be 0 or more' };
  if (num > MAX_KM_INPUT) return { valid: false, error: 'Seems too high — double check this value' };
  return { valid: true, error: null };
};

/**
 * Validate meals input
 * @param {number|string} meals
 * @returns {{ valid: boolean, error: string|null }}
 */
export const validateMeals = (meals) => {
  if (meals === undefined || meals === null || meals === '') return { valid: false, error: 'This field is required' };
  const num = Number(meals);
  if (isNaN(num)) return { valid: false, error: 'Please enter a number' };
  if (num < 0) return { valid: false, error: 'Must be 0 or more' };
  if (num > MAX_MEALS_INPUT) return { valid: false, error: 'Seems too high — double check this value' };
  return { valid: true, error: null };
};

/**
 * Validate energy input
 * @param {number|string} kwh
 * @returns {{ valid: boolean, error: string|null }}
 */
export const validateEnergy = (kwh) => {
  if (kwh === undefined || kwh === null || kwh === '') return { valid: false, error: 'This field is required' };
  const num = Number(kwh);
  if (isNaN(num)) return { valid: false, error: 'Please enter a number' };
  if (num < 0) return { valid: false, error: 'Must be 0 or more' };
  if (num > MAX_KWH_INPUT) return { valid: false, error: 'Seems too high — double check this value' };
  return { valid: true, error: null };
};

/**
 * Validate purchases input
 * @param {number|string} count
 * @returns {{ valid: boolean, error: string|null }}
 */
export const validatePurchases = (count) => {
  if (count === undefined || count === null || count === '') return { valid: false, error: 'This field is required' };
  const num = Number(count);
  if (isNaN(num)) return { valid: false, error: 'Please enter a number' };
  if (num < 0) return { valid: false, error: 'Must be 0 or more' };
  if (num > 100) return { valid: false, error: 'Seems too high — double check this value' };
  return { valid: true, error: null };
};
