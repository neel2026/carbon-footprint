const data = {
  profile: { name: "Neel", country: "India", transportMode: "car", dietType: "omnivore" },
  currentEntry: { date: "2026-06-21T00:00:00Z", inputs: {}, total: 10, breakdown: { transport: 2, diet: 5, energy: 1, shopping: 2 } },
  history: [],
  breakdown: { transport: 2, diet: 5, energy: 1, shopping: 2 },
  highestImpactCategory: "diet"
};

fetch('http://localhost:3001/api/insight', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
.then(res => res.json())
.then(json => console.log('API RESPONSE:', json))
.catch(err => console.error('API ERROR:', err));
