import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
const GEMINI_API_KEY=process.env.API_Key;
const router = express.Router();

let aiAssistanceEnabled = false;

router.get('/status', (req, res) => {
  res.json({ status: aiAssistanceEnabled });
});

router.post('/status', (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: "Missing request body" });
  }
  const { status } = req.body;
  if (typeof status !== 'boolean') {
    return res.status(400).json({ error: "'status' must be a boolean" });
  }
  aiAssistanceEnabled = status;
  res.json({ status: aiAssistanceEnabled });
});



router.post('/generate-hint', async (req, res) => {
  const { problem, code } = req.body;

  if (typeof problem !== 'string' || typeof code !== 'string') {
    return res.status(400).json({ error: "'problem' and 'code' must be strings" });
  }

  const prompt = `You are an assistant helping coding challenge participants.\nProvide a minimal helpful hint for the following problem:\n\n${problem}\n\nBase Code:\n${code}\n\nHint:`;

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_API_KEY;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  };

  try {
    const geminiResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API returned ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();

    // Extract generated text from Gemini response
    const hint =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      'No hint generated.';

    res.json({ hint });
  } catch (error) {
    console.error('Gemini hint generation error:', error);
    res.status(500).json({ error: 'Failed to generate hint' });
  }
});

export default router;