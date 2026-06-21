import {
  KG_CO2_PER_KM_CAR, KG_CO2_PER_KM_BUS, KG_CO2_PER_KM_TRAIN, KG_CO2_PER_KM_BIKE,
  KG_CO2_PER_BEEF_MEAL, KG_CO2_PER_VEGAN_MEAL, KG_CO2_PER_KWH, KG_CO2_PER_ONLINE_PURCHASE,
  INDIA_AVERAGE_ANNUAL_KG, WORLD_AVERAGE_ANNUAL_KG
} from './constants.js';

const getTransport = (km, mode) => {
  const map = { car: KG_CO2_PER_KM_CAR, bus: KG_CO2_PER_KM_BUS, train: KG_CO2_PER_KM_TRAIN };
  return km * (map[mode] || KG_CO2_PER_KM_BIKE);
};

const getDiet = (meals, type) => {
  if (type === 'vegan') return 21 * KG_CO2_PER_VEGAN_MEAL;
  if (type === 'vegetarian') return 21 * (KG_CO2_PER_VEGAN_MEAL + 0.1);
  return (meals * KG_CO2_PER_BEEF_MEAL) + (Math.max(0, 21 - meals) * KG_CO2_PER_VEGAN_MEAL);
};

/**
 * Calculate total weekly CO2 footprint from user inputs
 * @param {Object} inputs - { transportKm, transportMode, meatMeals, dietType, energyKwh, purchases }
 * @returns {Object} - { total, breakdown: { transport, diet, energy, shopping } }
 */
export const calculateFootprint = (inputs) => {
  const transport = getTransport(inputs.transportKm || 0, inputs.transportMode || 'car');
  const diet = getDiet(inputs.meatMeals || 0, inputs.dietType || 'omnivore');
  const energy = (inputs.energyKwh || 0) * KG_CO2_PER_KWH;
  const shopping = (inputs.purchases || 0) * KG_CO2_PER_ONLINE_PURCHASE;
  return { total: transport + diet + energy + shopping, breakdown: { transport, diet, energy, shopping } };
};

/**
 * Compare user footprint to India/World average
 * @param {number} userKgPerWeek
 * @returns {Object} - { vsIndia: number, vsWorld: number, percentile: string }
 */
export const compareToAverage = (userKgPerWeek) => {
  const userAnnual = userKgPerWeek * 52;
  const vsIndia = userAnnual / INDIA_AVERAGE_ANNUAL_KG;
  const vsWorld = userAnnual / WORLD_AVERAGE_ANNUAL_KG;
  let percentile = 'Average';
  if (vsIndia > 1.5) percentile = 'High';
  if (vsIndia < 0.5) percentile = 'Low';
  return { vsIndia, vsWorld, percentile };
};

/**
 * Find the single highest-impact category for this user
 * @param {Object} breakdown - { transport, diet, energy, shopping }
 * @returns {string} - category name
 */
export const getHighestImpactCategory = (breakdown) => {
  let highest = 'transport';
  if (breakdown.diet > breakdown[highest]) highest = 'diet';
  if (breakdown.energy > breakdown[highest]) highest = 'energy';
  if (breakdown.shopping > breakdown[highest]) highest = 'shopping';
  return highest;
};

/**
 * Format kg CO2 for display (round to 1 decimal, add unit)
 * @param {number} kg
 * @returns {string} - "12.3 kg CO₂"
 */
export const formatCO2 = (kg) => `${Number(kg).toFixed(1)} kg CO₂`;

const getStreakFromSorted = (sorted, startExpected) => {
  let streak = 0, expected = startExpected;
  for (const entry of sorted) {
    const t = new Date(entry.date).setHours(0, 0, 0, 0);
    if (t === expected) { streak++; expected -= 86400000; }
    else if (t < expected) break;
  }
  return streak;
};

/**
 * Calculate streak from history array
 * @param {Array} entries - array of { date, total }
 * @returns {number} - current streak in days
 */
export const calculateStreak = (entries) => {
  if (!entries || !entries.length) return 0;
  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const today = new Date().setHours(0, 0, 0, 0);
  const mostRecent = new Date(sorted[0].date).setHours(0, 0, 0, 0);
  if (mostRecent !== today && mostRecent !== today - 86400000) return 0;
  return getStreakFromSorted(sorted, mostRecent === today ? today : today - 86400000);
};

/**
 * Calculate week-over-week change
 * @param {Array} entries
 * @returns {number} - percentage change (negative = improvement)
 */
export const calculateTrend = (entries) => {
  if (!entries || entries.length < 2) return 0;
  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const cur = sorted[0].total, prev = sorted[1].total;
  if (prev === 0) return cur > 0 ? 100 : 0;
  return ((cur - prev) / prev) * 100;
};
