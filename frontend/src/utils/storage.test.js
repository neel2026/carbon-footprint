import { test, describe, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { saveEntry, getHistory, getProfile, saveProfile, clearHistory } from './storage.js';

describe('storage.js', () => {
  let mockStorage = {};

  beforeEach(() => {
    mockStorage = {};
    global.localStorage = {
      getItem: (key) => mockStorage[key] || null,
      setItem: (key, value) => { mockStorage[key] = String(value); },
      removeItem: (key) => { delete mockStorage[key]; }
    };
  });

  afterEach(() => {
    delete global.localStorage;
  });

  test('getProfile returns null when empty', () => {
    assert.strictEqual(getProfile(), null);
  });

  test('saveProfile saves and getProfile retrieves it', () => {
    const profile = { name: 'Test', country: 'India' };
    saveProfile(profile);
    assert.deepEqual(getProfile(), profile);
  });

  test('getHistory returns empty array when empty', () => {
    assert.deepEqual(getHistory(), []);
  });

  test('saveEntry saves and getHistory retrieves it', () => {
    const entry = { total: 10, date: '2026-06-21' };
    saveEntry(entry);
    assert.deepEqual(getHistory(), [entry]);
  });

  test('saveEntry limits history to HISTORY_DAYS (7)', () => {
    for (let i = 0; i < 10; i++) {
      saveEntry({ total: i, date: `2026-06-0${i}` });
    }
    const history = getHistory();
    assert.strictEqual(history.length, 7);
    assert.strictEqual(history[0].total, 9); // Most recent first
  });

  test('clearHistory removes history but not profile', () => {
    saveProfile({ name: 'Test' });
    saveEntry({ total: 10 });
    clearHistory();
    assert.deepEqual(getHistory(), []);
    assert.deepEqual(getProfile(), { name: 'Test' });
  });

  test('getHistory handles corrupted JSON gracefully', () => {
    global.localStorage.setItem('carbon_history', '{corrupted_json');
    assert.deepEqual(getHistory(), []);
  });

  test('getProfile handles corrupted JSON gracefully', () => {
    global.localStorage.setItem('carbon_profile', '{corrupted_json');
    assert.strictEqual(getProfile(), null);
  });

  test('saveEntry handles localStorage quota exceeded error gracefully', () => {
    global.localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
    assert.doesNotThrow(() => saveEntry({ total: 10 }));
  });
});
