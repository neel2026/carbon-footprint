import { AI_TIMEOUT_MS } from './constants.js';

export const fetchWithTimeout = async (url, options, timeoutMs = AI_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    clearTimeout(timeoutId);
    return { data: null, error: err.name === 'AbortError' ? 'timeout' : err.message };
  }
};
