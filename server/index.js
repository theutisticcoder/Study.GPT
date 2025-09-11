/**
 * Express server example
 * - POST /api/gemini receives { prompt, student, accommodations }
 * - Calls Google Gemini (server-side) using API key from environment variable
 *
 * IMPORTANT: This is a template. Replace the GEMINI call with the official client library or REST call per Google's docs.
 */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const GEMINI_KEY = process.env.GEMINI_KEY; // set this in your env
if(!GEMINI_KEY){
  console.warn('Warning: GEMINI_KEY not set. /api/gemini will return a mock reply.');
}

app.post('/api/gemini', async (req, res) => {
  const { prompt, student, accommodations } = req.body || {};
  if(!GEMINI_KEY){
    // Return a safe demo reply
    return res.json({ reply: `Demo server reply: received prompt of length ${String(prompt||'').length}. Set GEMINI_KEY to enable real Gemini responses.` });
  }

  try{
    // EXAMPLE: a simple REST call pattern (update per Google's current API):
    // Note: Google may require OAuth or different endpoints. Use official docs to choose correct approach.
    const apiUrl = 'https://api.example.google.com/v1/generate'; // placeholder — replace with real endpoint
    const body = { prompt, maxTokens: 800, temperature: 0.2, student, accommodations };
    const r = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type':'application/json',
        'Authorization': `Bearer ${GEMINI_KEY}`
      },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    // adapt below depending on Gemini response structure
    const reply = data?.output?.text || data?.reply || JSON.stringify(data);
    res.json({ reply });
  } catch(err){
    console.error(err);
    res.status(500).json({ error: 'server error', details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Server listening on', PORT));
