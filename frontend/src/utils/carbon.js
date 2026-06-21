import {
  KG_CO2_PER_KM_CAR,
  KG_CO2_PER_KM_BUS,
  KG_CO2_PER_KM_TRAIN,
  KG_CO2_PER_KM_BIKE,
  KG_CO2_PER_BEEF_MEAL,
  KG_CO2_PER_VEGAN_MEAL,
  KG_CO2_PER_KWH,
  KG_CO2_PER_ONLINE_PURCHASE,
  INDIA_AVERAGE_ANNUAL_KG,
  WORLD_AVERAGE_ANNUAL_KG
} from './constants.js';

/**
 * Calculate total weekly CO2 footprint from user inputs
 * @param {Object} inputs - { transportKm, transportMode, meatMeals, dietType, energyKwh, purchases }
 * @returns {Object} - { total, breakdown: { transport, diet, energy, shopping } }
 */
export const calculateFootprint = (inputs) => {
  const { transportKm = 0, transportMode = 'car', meatMeals = 0, dietType = 'omnivore', energyKwh = 0, purchases = 0 } = inputs;
  
  let transportFactor = 0;
  if (transportMode === 'car') transportFactor = KG_CO2_PER_KM_CAR;
  if (transportMode === 'bus') transportFactor = KG_CO2_PER_KM_BUS;
  if (transportMode === 'train') transportFactor = KG_CO2_PER_KM_TRAIN;
  if (transportMode === 'bike' || transportMode === 'walk') transportFactor = KG_CO2_PER_KM_BIKE;

  const transport = transportKm * transportFactor;

  let diet = 0;
  if (dietType === 'vegan') {
    diet = 21 * KG_CO2_PER_VEGAN_MEAL;
  } else if (dietType === 'vegetarian') {
    diet = 21 * (KG_CO2_PER_VEGAN_MEAL + 0.1); // slight bump for dairy
  } else {
    // omnivore
    const nonMeatMeals = Math.max(0, 21 - meatMeals);
    // Let's assume all meat meals are beef to be safe
    diet = (meatMeals * KG_CO2_PER_BEEF_MEAL) + (nonMeatMeals * KG_CO2_PER_VEGAN_MEAL);
  }

  const energy = energyKwh * KG_CO2_PER_KWH;
  const shopping = purchases * KG_CO2_PER_ONLINE_PURCHASE;

  const total = transport + diet + energy + shopping;

  return {
    total,
    breakdown: { transport, diet, energy, shopping }
  };
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
  let max = breakdown.transport;

  if (breakdown.diet > max) { highest = 'diet'; max = breakdown.diet; }
  if (breakdown.energy > max) { highest = 'energy'; max = breakdown.energy; }
  if (breakdown.shopping > max) { highest = 'shopping'; max = breakdown.shopping; }

  return highest;
};

/**
 * Format kg CO2 for display (round to 1 decimal, add unit)
 * @param {number} kg
 * @returns {string} - "12.3 kg CO₂"
 */
export const formatCO2 = (kg) => {
  return `${Number(kg).toFixed(1)} kg CO₂`;
};

/**
 * Calculate streak from history array
 * @param {Array} entries - array of { date, total }
 * @returns {number} - current streak in days
 */
export const calculateStreak = (entries) => {
  if (!entries || entries.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  let expectedDate = today.getTime();
  const mostRecentTime = new Date(sorted[0].date).setHours(0, 0, 0, 0);
  const oneDay = 24 * 60 * 60 * 1000;

  if (mostRecentTime !== expectedDate && mostRecentTime !== expectedDate - oneDay) {
    return 0; // Streak broken
  }

  if (mostRecentTime === expectedDate - oneDay) {
    expectedDate -= oneDay; // Streak starts from yesterday
  }

  for (const entry of sorted) {
    const entryTime = new Date(entry.date).setHours(0, 0, 0, 0);
    if (entryTime === expectedDate) {
      streak++;
      expectedDate -= oneDay;
    } else if (entryTime < expectedDate) {
      break; // Gap found
    }
  }

  return streak;
};

/**
 * Calculate week-over-week change
 * @param {Array} entries
 * @returns {number} - percentage change (negative = improvement)
 */
export const calculateTrend = (entries) => {
  if (!entries || entries.length < 2) return 0;
  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const current = sorted[0].total;
  const previous = sorted[1].total;
  
  if (previous === 0) return current > 0 ? 100 : 0;
  
  return ((current - previous) / previous) * 100;
};
