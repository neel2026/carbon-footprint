import { useState } from 'react';
import { getHistory, saveEntry } from '../utils/storage.js';

export const useHistory = () => {
  const [history, setHistory] = useState(() => getHistory());

  const addEntry = (entry) => {
    saveEntry(entry);
    setHistory(getHistory());
  };

  return { history, addEntry };
};
