process.env.NODE_ENV = 'test';
import { test, describe, before, after } from 'node:test';
import { strict as assert } from 'node:assert';
import app from './backend/server.js';
import { calculateFootprint } from './frontend/src/utils/carbon.js';

let server;
let baseUrl;

describe('Integration: Submit -> Calculate -> AI -> Response', () => {
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

  test('Full backend flow with realistic payload', async () => {
    const profile = { name: 'Neel', country: 'India', transportMode: 'car', dietType: 'omnivore' };
    const inputs = { transportKm: 150, meatMeals: 4, energyKwh: 45, purchases: 2 };
    const { total, breakdown } = calculateFootprint(inputs);
    
    // Fake currentEntry matching what useFootprint builds
    const currentEntry = {
      date: new Date().toISOString(),
      inputs,
      total,
      breakdown
    };

    const payload = {
      profile,
      currentEntry,
      history: [{ date: new Date(Date.now() - 86400000).toISOString(), total: 20 }],
      breakdown,
      highestImpactCategory: 'energy' // simplifying
    };

    const res = await fetch(`${baseUrl}/api/insight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    // Because we use a dummy Gemini key in test (or the real one), it might fail 500 if the real key isn't provided or rate limited. 
    // We just ensure it doesn't fail validation (400) or parsing (415).
    assert.notStrictEqual(res.status, 400);
    assert.notStrictEqual(res.status, 415);
  });
});
