import { HISTORY_DAYS } from './constants.js';

/**
 * Save a new entry to history
 * @param {Object} entry - { date, inputs, total, breakdown }
 */
export const saveEntry = (entry) => {
  try {
    const history = getHistory();
    const newHistory = [entry, ...history].slice(0, HISTORY_DAYS);
    localStorage.setItem('carbon_history', JSON.stringify(newHistory));
  } catch (e) {
    // Ignore error, localStorage may be blocked
  }
};

/**
 * Get history
 * @returns {Array} - returns last HISTORY_DAYS entries
 */
export const getHistory = () => {
  try {
    const data = localStorage.getItem('carbon_history');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

/**
 * Get onboarding profile
 * @returns {Object|null} - onboarding data
 */
export const getProfile = () => {
  try {
    const data = localStorage.getItem('carbon_profile');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

/**
 * Save profile
 * @param {Object} profile 
 */
export const saveProfile = (profile) => {
  try {
    localStorage.setItem('carbon_profile', JSON.stringify(profile));
  } catch (e) {
    // silently fail
  }
};

/**
 * Clear history
 */
export const clearHistory = () => {
  try {
    localStorage.removeItem('carbon_history');
  } catch (e) {
    // silently fail
  }
};
