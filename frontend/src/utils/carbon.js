import {
  KG_CO2_PER_KM_CAR, KG_CO2_PER_KM_BUS, KG_CO2_PER_KM_TRAIN, KG_CO2_PER_KM_BIKE,
  KG_CO2_PER_MEAT_MEAL, KG_CO2_PER_VEGETARIAN_MEAL, KG_CO2_PER_VEGAN_MEAL, 
  KG_CO2_PER_KWH_MAP, KG_CO2_PER_ONLINE_PURCHASE,
  INDIA_AVERAGE_ANNUAL_KG, WORLD_AVERAGE_ANNUAL_KG,
  WEEKS_PER_YEAR, MS_PER_DAY, MEALS_PER_WEEK
} from './constants.js';

const getTransport = (km, mode) => {
  const map = { car: KG_CO2_PER_KM_CAR, bus: KG_CO2_PER_KM_BUS, train: KG_CO2_PER_KM_TRAIN };
  return km * (map[mode] || KG_CO2_PER_KM_BIKE);
};

const getDiet = (meatMeals, type) => {
  if (type === 'vegan') return MEALS_PER_WEEK * KG_CO2_PER_VEGAN_MEAL;
  if (type === 'vegetarian') return MEALS_PER_WEEK * KG_CO2_PER_VEGETARIAN_MEAL;
  const plantMeals = Math.max(0, MEALS_PER_WEEK - meatMeals);
  return (meatMeals * KG_CO2_PER_MEAT_MEAL) + (plantMeals * KG_CO2_PER_VEGETARIAN_MEAL);
};

export const calculateFootprint = (inputs, profile = {}) => {
  const transport = getTransport(inputs.transportKm || 0, profile.transportMode || inputs.transportMode || 'car');
  const diet = getDiet(inputs.meatMeals || 0, profile.dietType || inputs.dietType || 'omnivore');
  const country = profile.country || 'Other';
  const gridFactor = KG_CO2_PER_KWH_MAP[country] || KG_CO2_PER_KWH_MAP['Other'];
  const energy = (inputs.energyKwh || 0) * gridFactor;
  const shopping = (inputs.purchases || 0) * KG_CO2_PER_ONLINE_PURCHASE;
  return { total: transport + diet + energy + shopping, breakdown: { transport, diet, energy, shopping } };
};

export const compareToAverage = (userKgPerWeek) => {
  const userAnnual = userKgPerWeek * WEEKS_PER_YEAR;
  const vsIndia = userAnnual / INDIA_AVERAGE_ANNUAL_KG;
  const vsWorld = userAnnual / WORLD_AVERAGE_ANNUAL_KG;
  let percentile = 'Average';
  if (vsIndia > 1.5) percentile = 'High';
  if (vsIndia < 0.5) percentile = 'Low';
  return { vsIndia, vsWorld, percentile };
};

export const getHighestImpactCategory = (breakdown) => {
  let highest = 'transport';
  if (breakdown.diet > breakdown[highest]) highest = 'diet';
  if (breakdown.energy > breakdown[highest]) highest = 'energy';
  if (breakdown.shopping > breakdown[highest]) highest = 'shopping';
  return highest;
};

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

export const calculateStreak = (entries) => {
  if (!entries || !entries.length) return 0;
  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const today = new Date().setHours(0, 0, 0, 0);
  const mostRecent = new Date(sorted[0].date).setHours(0, 0, 0, 0);
  if (mostRecent !== today && mostRecent !== today - MS_PER_DAY) return 0;
  return getStreakFromSorted(sorted, mostRecent === today ? today : today - MS_PER_DAY);
};

export const calculateTrend = (entries) => {
  if (!entries || entries.length < 2) return 0;
  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const cur = sorted[0].total, prev = sorted[1].total;
  if (prev === 0) return cur > 0 ? 100 : 0;
  return ((cur - prev) / prev) * 100;
};
