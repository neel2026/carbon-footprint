import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://carbon-tracker-rust.vercel.app'
];

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  }
}));

// Enforce Content-Type for POST requests
app.use((req, res, next) => {
  if (req.method === 'POST' && !req.headers['content-type']?.includes('application/json')) {
    return res.status(415).json({ error: 'Content-Type must be application/json' });
  }
  next();
});

app.use(express.json({ limit: '10kb' }));

// Rate Limiter: 10 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/', apiLimiter);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'dummy_key',
});

// Helper for type checking and limits
const isValidNumber = (val, min, max) => typeof val === 'number' && isFinite(val) && val >= min && val <= max;
const isValidString = (val, allowedValues) => typeof val === 'string' && allowedValues.includes(val);

const validateInput = (body) => {
  const { profile, currentEntry, history, breakdown, highestImpactCategory } = body;

  if (!profile || !currentEntry || !breakdown || !highestImpactCategory) return 'Missing required top-level fields';
  if (!isValidString(highestImpactCategory, ['transport', 'diet', 'energy', 'shopping'])) return 'Invalid highestImpactCategory';

  if (!profile.name || typeof profile.name !== 'string' || profile.name.length > 50) return 'Invalid profile name';
  if (!isValidString(profile.country, ['India', 'USA', 'UK', 'Other'])) return 'Invalid country';
  if (!isValidString(profile.transportMode, ['car', 'bus', 'train', 'bike'])) return 'Invalid transportMode';
  if (!isValidString(profile.dietType, ['omnivore', 'vegetarian', 'vegan'])) return 'Invalid dietType';

  const inputs = currentEntry.inputs;
  if (!inputs) return 'Missing currentEntry.inputs';
  
  if (!isValidNumber(inputs.transportKm, 0, 2000)) return 'Invalid transportKm';
  if (inputs.meatMeals !== undefined && !isValidNumber(inputs.meatMeals, 0, 21)) return 'Invalid meatMeals';
  if (!isValidNumber(inputs.energyKwh, 0, 10000)) return 'Invalid energyKwh';
  if (!isValidNumber(inputs.purchases, 0, 100)) return 'Invalid purchases';

  for (const key of ['transport', 'diet', 'energy', 'shopping']) {
    if (!isValidNumber(breakdown[key], 0, 1000000)) return `Invalid breakdown.${key}`;
  }

  if (history && !Array.isArray(history)) return 'History must be an array';

  return null; // Valid
};

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: Date.now()
  });
});

// POST /api/insight
app.post('/api/insight', async (req, res) => {
  try {
    const errorMsg = validateInput(req.body);
    if (errorMsg) {
      return res.status(400).json({ error: errorMsg });
    }

    const { profile, currentEntry, history, breakdown, highestImpactCategory } = req.body;

    // Sanitize profile name (strip HTML/special chars)
    const sanitizedName = profile.name.replace(/[^a-zA-Z0-9 ]/g, '').trim().substring(0, 50);

    // Sanitize history to just recent trends to save tokens and prevent injection
    const sanitizedHistory = (history || []).slice(0, 7).map(h => ({
      date: String(h.date).replace(/[^0-9T:Z.-]/g, '').substring(0, 30),
      total: typeof h.total === 'number' ? Number(h.total.toFixed(2)) : 0
    }));

    const promptData = JSON.stringify({ 
      profile: { ...profile, name: sanitizedName }, 
      actualInputs: currentEntry.inputs,
      breakdown, 
      highestImpactCategory,
      recentHistory: sanitizedHistory
    });

    const systemPrompt = `You are a carbon footprint reduction coach with deep knowledge of climate science and behavioral psychology.

You receive a user's actual footprint data broken down by category, their EXACT weekly inputs (like km driven or meat meals eaten), and their recent history.
Your job is NOT to give generic climate advice.
Your job is to find the SINGLE highest-leverage action for THIS specific person based on their actual numbers, and explain exactly how much CO2 they would save.

Be specific. Be honest. Be actionable. Not preachy. Use the actual inputs provided to make the recommendation (e.g. if they drove 200km, suggest reducing it by 20km).

Return ONLY valid JSON. No markdown. No preamble. No explanation outside JSON.

{
  "recommendation": "2-3 sentences. Address their specific data. Acknowledge what they're already doing well before suggesting a change.",
  "action": "One specific action. Not 'eat less meat'. Specific: 'Replace 2 of your 5 weekly beef meals with lentils or paneer'",
  "estimatedSavingKg": 5.2,
  "savingExplanation": "1 sentence: how you calculated this saving",
  "category": "diet|transport|energy|shopping",
  "difficulty": "easy|medium|hard",
  "timeToImpact": "this week|this month|long-term"
}

Rules:
- Never say "Great job!" or use hollow encouragement
- Always reference the user's actual numbers, not averages
- If they are already low-footprint, acknowledge it and give a maintenance tip
- Difficulty: easy = 0 lifestyle change, medium = small habit, hard = major change
- estimatedSavingKg must be a realistic number you can back up
- Return ONLY valid JSON. No exceptions.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `User data: ${promptData}`,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    const rawContent = response.text;
    const jsonStr = rawContent.replace(/```json\n?|\n?```/g, '').trim();
    
    let insight;
    try {
      insight = JSON.parse(jsonStr);
    } catch (e) {
      return res.status(502).json({ error: 'AI returned invalid data format' });
    }

    // Deep validation of AI schema
    if (
      typeof insight.recommendation !== 'string' || insight.recommendation.length > 500 ||
      typeof insight.action !== 'string' || insight.action.length > 200 ||
      typeof insight.estimatedSavingKg !== 'number' || insight.estimatedSavingKg < 0 ||
      typeof insight.savingExplanation !== 'string' || insight.savingExplanation.length > 200 ||
      !['diet', 'transport', 'energy', 'shopping'].includes(insight.category) ||
      !['easy', 'medium', 'hard'].includes(insight.difficulty) ||
      typeof insight.timeToImpact !== 'string' || insight.timeToImpact.length > 50
    ) {
      return res.status(502).json({ error: 'AI response missing or invalid fields' });
    }

    res.json(insight);
  } catch (error) {
    console.error("DEBUG ERROR:", error);
    res.status(500).json({ error: 'Unable to generate insight. Please try again.' });
  }
});

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  app.listen(port);
}

export default app;
