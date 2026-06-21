# Carbon Footprint Tracker

A personalized carbon footprint tracking application that helps users understand, track, and reduce their emissions with AI-powered insights.

## Project Structure
- `frontend/`: React + Vite application
- `backend/`: Node.js + Express API

## Setup Instructions

### 1. Backend Setup
1. Navigate to the `backend/` directory.
2. Run `npm install` to install dependencies.
3. Create a `.env` file in the `backend/` directory with your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3001
   ```
4. Start the server: `node server.js`

### 2. Frontend Setup
1. Navigate to the `frontend/` directory.
2. Run `npm install` to install dependencies.
3. Start the Vite development server: `npm run dev`

## Deployment
This project is configured to deploy easily on Vercel. 
Ensure the `GEMINI_API_KEY` is added to your Vercel Environment Variables.
The provided `vercel.json` will automatically route `/api/*` traffic to the backend.
