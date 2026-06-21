// constants.js — EVERY number must come from here, never inline
export const KG_CO2_PER_KM_CAR = 0.21;
export const KG_CO2_PER_KM_BUS = 0.089;
export const KG_CO2_PER_KM_TRAIN = 0.041;
export const KG_CO2_PER_KM_BIKE = 0;

export const KG_CO2_PER_MEAT_MEAL = 2.5;        // blended average (beef + chicken + pork)
export const KG_CO2_PER_VEGETARIAN_MEAL = 0.5;
export const KG_CO2_PER_VEGAN_MEAL = 0.3;

export const KG_CO2_PER_KWH_MAP = {
  'India': 0.82,
  'USA': 0.38,
  'UK': 0.23,
  'Other': 0.50
};

export const KG_CO2_PER_ONLINE_PURCHASE = 4.5;
export const INDIA_AVERAGE_ANNUAL_KG = 1900;
export const WORLD_AVERAGE_ANNUAL_KG = 4000;
export const COUNTRY_AVERAGE_ANNUAL_KG = {
  India: INDIA_AVERAGE_ANNUAL_KG,
  USA: 14900,
  UK: 4700,
  Other: WORLD_AVERAGE_ANNUAL_KG
};

export const CHART_INNER_RADIUS = 60;
export const CHART_OUTER_RADIUS = 80;

export const MAX_KM_INPUT = 2000;
export const MAX_MEALS_INPUT = 21;
export const MAX_KWH_INPUT = 10000;
export const MAX_PURCHASES_INPUT = 100;

export const HISTORY_DAYS = 7;
export const AI_TIMEOUT_MS = 60000;
export const WEEKS_PER_YEAR = 52;
export const MS_PER_DAY = 86400000;
export const MEALS_PER_WEEK = 21;
