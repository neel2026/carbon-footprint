import { test, describe, mock, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { fetchWithTimeout } from './api.js';

describe('fetchWithTimeout', () => {
  afterEach(() => {
    mock.restoreAll();
  });

  test('returns data on successful fetch', async () => {
    globalThis.fetch = mock.fn(async () => ({
      ok: true,
      json: async () => ({ success: true })
    }));

    const result = await fetchWithTimeout('/test', {});
    assert.deepEqual(result.data, { success: true });
    assert.strictEqual(result.error, null);
  });

  test('returns error on HTTP failure', async () => {
    globalThis.fetch = mock.fn(async () => ({
      ok: false,
      status: 500
    }));

    const result = await fetchWithTimeout('/test', {});
    assert.strictEqual(result.data, null);
    assert.strictEqual(result.error, 'HTTP 500');
  });

  test('returns timeout error when aborted', async () => {
    globalThis.fetch = mock.fn(async (_, { signal }) => {
      return new Promise((_, reject) => {
        const error = new Error('The operation was aborted');
        error.name = 'AbortError';
        
        signal.addEventListener('abort', () => reject(error));
        // Simulate a slow request that exceeds the timeout
        setTimeout(() => {}, 100);
      });
    });

    const result = await fetchWithTimeout('/test', {}, 10);
    assert.strictEqual(result.data, null);
    assert.strictEqual(result.error, 'timeout');
  });

  test('returns generic error on network failure', async () => {
    globalThis.fetch = mock.fn(async () => {
      throw new Error('Network error');
    });

    const result = await fetchWithTimeout('/test', {});
    assert.strictEqual(result.data, null);
    assert.strictEqual(result.error, 'Network error');
  });
});
