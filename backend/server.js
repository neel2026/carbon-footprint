import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173' }));
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
    const { profile, currentEntry, history, breakdown, highestImpactCategory } = req.body;

    if (!profile || !breakdown || !highestImpactCategory) {
      return res.status(400).json({ error: 'Missing required data' });
    }

    const promptData = JSON.stringify({ profile, breakdown, highestImpactCategory });

    const systemPrompt = `You are a carbon footprint reduction coach with deep knowledge of climate science and behavioral psychology.

You receive a user's actual footprint data broken down by category.
Your job is NOT to give generic climate advice.
Your job is to find the SINGLE highest-leverage action for THIS specific person based on their actual numbers, and explain exactly how much CO2 they would save.

Be specific. Be honest. Be actionable. Not preachy.

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
    const insight = JSON.parse(jsonStr);

    res.json(insight);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.listen(port, () => {});
