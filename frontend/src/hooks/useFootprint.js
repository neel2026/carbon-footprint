import { useState, useRef, useCallback } from 'react';
import { calculateFootprint, getHighestImpactCategory } from '../utils/carbon.js';
import { fetchWithTimeout } from '../utils/api.js';

const buildEntry = (inputs, profile) => {
  const { total, breakdown } = calculateFootprint(inputs, profile);
  return { date: new Date().toISOString(), inputs, total, breakdown };
};

const processInsightResult = (data, fetchErr, entry, profile, setError, setInsight) => {
  if (fetchErr) {
    const msg = fetchErr === 'timeout' ? 'Taking longer than usual, try again' : 'Something went wrong. Please try again.';
    setError(msg); return { success: false, entry, error: msg };
  }
  if (data?.error) {
    setError(data.error); return { success: false, entry, error: data.error };
  }
  setInsight({ ...data, currentEntry: entry, profile });
  return { success: true, entry };
};

export const useFootprint = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insight, setInsight] = useState(null);
  const pendingRef = useRef(false);

  const submitFootprint = useCallback(async (profile, inputs, history) => {
    if (pendingRef.current) return { success: false, entry: null, error: 'Already submitting' };
    pendingRef.current = true;
    setIsLoading(true); setError(null); setInsight(null);
    const entry = buildEntry(inputs, profile);
    const { data, error: err } = await fetchWithTimeout('/api/insight', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, currentEntry: entry, history, breakdown: entry.breakdown, highestImpactCategory: getHighestImpactCategory(entry.breakdown) })
    });
    setIsLoading(false);
    pendingRef.current = false;
    return processInsightResult(data, err, entry, profile, setError, setInsight);
  }, []);

  return { submitFootprint, isLoading, error, insight };
};
