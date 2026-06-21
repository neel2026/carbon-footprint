import { useState } from 'react';
import { calculateFootprint, getHighestImpactCategory } from '../utils/carbon.js';
import { fetchWithTimeout } from '../utils/api.js';

export const useFootprint = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insight, setInsight] = useState(null);

  const submitFootprint = async (profile, inputs, history) => {
    setIsLoading(true);
    setError(null);
    setInsight(null);

    const { total, breakdown } = calculateFootprint(inputs);
    const highestImpactCategory = getHighestImpactCategory(breakdown);
    const currentEntry = { date: new Date().toISOString(), inputs, total, breakdown };

    const { data, error: fetchErr } = await fetchWithTimeout('/api/insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile,
        currentEntry,
        history,
        breakdown,
        highestImpactCategory
      })
    });

    setIsLoading(false);

    if (fetchErr) {
      const errMsg = fetchErr === 'timeout' ? 'Taking longer than usual, try again' : 'Something went wrong. Please try again.';
      setError(errMsg);
      return { success: false, entry: currentEntry, error: errMsg };
    }

    if (data && data.error) {
      setError(data.error);
      return { success: false, entry: currentEntry, error: data.error };
    }

    setInsight({ ...data, currentEntry });
    return { success: true, entry: currentEntry };
  };

  return { submitFootprint, isLoading, error, insight };
};
