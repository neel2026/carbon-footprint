import {
  KG_CO2_PER_KM_CAR, KG_CO2_PER_KM_BUS, KG_CO2_PER_KM_TRAIN, KG_CO2_PER_KM_BIKE,
  KG_CO2_PER_MEAT_MEAL, KG_CO2_PER_VEGETARIAN_MEAL, KG_CO2_PER_VEGAN_MEAL, 
  KG_CO2_PER_KWH_MAP, KG_CO2_PER_ONLINE_PURCHASE,
  INDIA_AVERAGE_ANNUAL_KG, WORLD_AVERAGE_ANNUAL_KG, COUNTRY_AVERAGE_ANNUAL_KG,
  WEEKS_PER_YEAR, MS_PER_DAY, MEALS_PER_WEEK
} from './constants.js';

/**
 * Calculate transport emissions
 * @param {number} km - Distance traveled
 * @param {string} mode - Transport mode (car, bus, train, bike)
 * @returns {number} Emissions in kg CO2
 */
const getTransport = (km, mode) => {
  const map = { car: KG_CO2_PER_KM_CAR, bus: KG_CO2_PER_KM_BUS, train: KG_CO2_PER_KM_TRAIN };
  return km * (map[mode] || KG_CO2_PER_KM_BIKE);
};

/**
 * Calculate diet emissions
 * @param {number} meatMeals - Number of meat meals per week
 * @param {string} type - Diet type (omnivore, vegetarian, vegan)
 * @returns {number} Emissions in kg CO2
 */
const getDiet = (meatMeals, type) => {
  if (type === 'vegan') return MEALS_PER_WEEK * KG_CO2_PER_VEGAN_MEAL;
  if (type === 'vegetarian') return MEALS_PER_WEEK * KG_CO2_PER_VEGETARIAN_MEAL;
  const plantMeals = Math.max(0, MEALS_PER_WEEK - meatMeals);
  return (meatMeals * KG_CO2_PER_MEAT_MEAL) + (plantMeals * KG_CO2_PER_VEGETARIAN_MEAL);
};

/**
 * Calculate total weekly CO2 footprint from user inputs
 * @param {Object} inputs - { transportKm, transportMode, meatMeals, dietType, energyKwh, purchases }
 * @param {Object} [profile={}] - User profile for country and default settings
 * @returns {Object} - { total, breakdown: { transport, diet, energy, shopping } }
 */
export const calculateFootprint = (inputs, profile = {}) => {
  const transport = getTransport(inputs.transportKm || 0, profile.transportMode || inputs.transportMode || 'car');
  const diet = getDiet(inputs.meatMeals || 0, profile.dietType || inputs.dietType || 'omnivore');
  const country = profile.country || 'Other';
  const gridFactor = KG_CO2_PER_KWH_MAP[country] || KG_CO2_PER_KWH_MAP['Other'];
  const energy = (inputs.energyKwh || 0) * gridFactor;
  const shopping = (inputs.purchases || 0) * KG_CO2_PER_ONLINE_PURCHASE;
  return { total: transport + diet + energy + shopping, breakdown: { transport, diet, energy, shopping } };
};

/**
 * Compare a weekly footprint to country and world annual averages
 * @param {number} userKgPerWeek - Weekly emissions in kg
 * @param {string} [country='India'] - Country used for the local comparison
 * @returns {Object} Comparison ratios and a low/average/high classification
 */
export const compareToAverage = (userKgPerWeek, country = 'India') => {
  const userAnnual = userKgPerWeek * WEEKS_PER_YEAR;
  const vsIndia = userAnnual / INDIA_AVERAGE_ANNUAL_KG;
  const vsWorld = userAnnual / WORLD_AVERAGE_ANNUAL_KG;
  const countryAverage = COUNTRY_AVERAGE_ANNUAL_KG[country] || COUNTRY_AVERAGE_ANNUAL_KG.Other;
  const vsCountry = userAnnual / countryAverage;
  let percentile = 'Average';
  if (vsCountry > 1.5) percentile = 'High';
  if (vsCountry < 0.5) percentile = 'Low';
  return { vsCountry, vsIndia, vsWorld, percentile };
};

/**
 * Find the category with the largest calculated footprint.
 * @param {Object} breakdown - Category emissions
 * @returns {string} Dominant category name
 */
export const getHighestImpactCategory = (breakdown) => {
  let highest = 'transport';
  if (breakdown.diet > breakdown[highest]) highest = 'diet';
  if (breakdown.energy > breakdown[highest]) highest = 'energy';
  if (breakdown.shopping > breakdown[highest]) highest = 'shopping';
  return highest;
};

/**
 * Format carbon emissions for display.
 * @param {number|string} kg - Emissions in kilograms
 * @returns {string} Formatted value with unit
 */
export const formatCO2 = (kg) => `${Number(kg).toFixed(1)} kg CO₂`;

const getStreakFromSorted = (sorted, startExpected) => {
  let streak = 0, expected = startExpected;
  for (const entry of sorted) {
    const t = new Date(entry.date).setHours(0, 0, 0, 0);
    if (t === expected) { streak++; expected -= MS_PER_DAY; }
    else if (t < expected) break;
  }
  return streak;
};

/**
 * Calculate the current daily logging streak.
 * @param {Array} entries - History entries with ISO dates
 * @returns {number} Consecutive day count
 */
export const calculateStreak = (entries) => {
  if (!entries || !entries.length) return 0;
  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const today = new Date().setHours(0, 0, 0, 0);
  const mostRecent = new Date(sorted[0].date).setHours(0, 0, 0, 0);
  if (mostRecent !== today && mostRecent !== today - MS_PER_DAY) return 0;
  return getStreakFromSorted(sorted, mostRecent === today ? today : today - MS_PER_DAY);
};

/**
 * Calculate change between the two most recent entries.
 * @param {Array} entries - History entries with totals
 * @returns {number} Percentage change, where negative means improvement
 */
export const calculateTrend = (entries) => {
  if (!entries || entries.length < 2) return 0;
  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const cur = sorted[0].total, prev = sorted[1].total;
  if (prev === 0) return cur > 0 ? 100 : 0;
  return ((cur - prev) / prev) * 100;
};
