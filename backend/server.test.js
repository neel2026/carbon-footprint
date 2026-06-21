process.env.NODE_ENV = 'test';
import { test, describe, before, after } from 'node:test';
import { strict as assert } from 'node:assert';
import app from './server.js';

let server;
let baseUrl;

describe('Backend API Tests', () => {
  before(() => {
    return new Promise((resolve) => {
      server = app.listen(0, () => {
        baseUrl = `http://localhost:${server.address().port}`;
        resolve();
      });
    });
  });

  after(() => {
    if (server) server.close();
  });

  test('GET /api/health returns 200 ok', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
    assert.ok(data.timestamp);
  });

  test('POST /api/insight rejects non-JSON content type', async () => {
    const res = await fetch(`${baseUrl}/api/insight`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'test'
    });
    assert.strictEqual(res.status, 415);
    const data = await res.json();
    assert.strictEqual(data.error, 'Content-Type must be application/json');
  });

  test('POST /api/insight rejects missing top-level fields', async () => {
    const res = await fetch(`${baseUrl}/api/insight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: {} }) // Missing breakdown, currentEntry, highestImpactCategory
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'Missing required top-level fields');
  });

  test('POST /api/insight rejects invalid numbers in inputs', async () => {
    const payload = {
      profile: { name: 'Test', country: 'India', transportMode: 'car', dietType: 'omnivore' },
      highestImpactCategory: 'diet',
      breakdown: { transport: 10, diet: 20, energy: 30, shopping: 40 },
      currentEntry: { inputs: { transportKm: -5, meatMeals: 5, energyKwh: 50, purchases: 2 } }
    };

    const res = await fetch(`${baseUrl}/api/insight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'Invalid transportKm');
  });

  test('POST /api/insight rejects invalid profile country enum', async () => {
    const payload = {
      profile: { name: 'Test', country: 'InvalidCountry', transportMode: 'car', dietType: 'omnivore' },
      highestImpactCategory: 'diet',
      breakdown: { transport: 10, diet: 20, energy: 30, shopping: 40 },
      currentEntry: { inputs: { transportKm: 50, meatMeals: 5, energyKwh: 50, purchases: 2 } }
    };

    const res = await fetch(`${baseUrl}/api/insight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'Invalid country');
  });
});
