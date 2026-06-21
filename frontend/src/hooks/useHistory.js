import { useState, useCallback } from 'react';
import { getHistory, saveEntry } from '../utils/storage.js';

export const useHistory = () => {
  const [history, setHistory] = useState(() => getHistory());

  const addEntry = useCallback((entry) => {
    saveEntry(entry);
    setHistory(getHistory());
  }, []);

  return { history, addEntry };
};
