process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-key';
import { test, describe, before, after, mock } from 'node:test';
import { strict as assert } from 'node:assert';
import { calculateFootprint } from './frontend/src/utils/carbon.js';

let server;
let baseUrl;
let aiRequestBody;

describe('Integration: Submit -> Calculate -> AI -> Response', () => {
  before(async () => {
    // Save original fetch
    const originalFetch = globalThis.fetch;
    
    // Set up fetch mock BEFORE importing the server
    globalThis.fetch = mock.fn(async (url, options) => {
      if (typeof url === 'string' && url.includes('generativelanguage.googleapis.com')) {
        aiRequestBody = JSON.parse(options.body);
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({
            candidates: [{
              content: {
                parts: [{
                  text: JSON.stringify({
                    recommendation: "Test recommendation",
                    action: "Test action",
                    estimatedSavingKg: 5.2,
                    savingExplanation: "Test explanation",
                    category: "energy",
                    difficulty: "medium",
                    timeToImpact: "this week"
                  })
                }]
              }
            }]
          })
        };
      }
      return originalFetch(url, options);
    });

    // NOW dynamically import server so GoogleGenAI uses the mocked fetch
    const { default: app } = await import('./backend/server.js');

    return new Promise((resolve) => {
      server = app.listen(0, () => {
        baseUrl = `http://localhost:${server.address().port}`;
        resolve();
      });
    });
  });

  after(() => {
    if (server) server.close();
    mock.restoreAll();
  });

  test('Full backend flow with realistic payload', async () => {
    const profile = { name: 'Neel', country: 'India', transportMode: 'car', dietType: 'omnivore', homeSize: 'medium' };
    const inputs = { transportKm: 150, meatMeals: 4, energyKwh: 45, purchases: 2 };
    const { total, breakdown } = calculateFootprint(inputs, profile);
    
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
      breakdown: { transport: 999999, diet: 999999, energy: 0, shopping: 0 },
      highestImpactCategory: 'transport'
    };

    const originalFetch = Object.getPrototypeOf(globalThis).fetch || fetch;

    const res = await originalFetch(`${baseUrl}/api/insight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    
    assert.strictEqual(res.status, 200, `API should return 200 OK, got ${res.status}: ${JSON.stringify(data)}`);
    
    // Complete Schema Validation of the response
    assert.strictEqual(typeof data.recommendation, 'string');
    assert.strictEqual(typeof data.action, 'string');
    assert.strictEqual(typeof data.estimatedSavingKg, 'number');
    assert.strictEqual(typeof data.savingExplanation, 'string');
    assert.strictEqual(typeof data.category, 'string');
    assert.strictEqual(typeof data.difficulty, 'string');
    assert.strictEqual(typeof data.timeToImpact, 'string');

    const promptText = aiRequestBody.contents[0].parts[0].text;
    const promptData = JSON.parse(promptText.replace('User data: ', ''));
    assert.deepEqual(promptData.breakdown, breakdown);
    assert.strictEqual(promptData.highestImpactCategory, 'energy');
  });
});
