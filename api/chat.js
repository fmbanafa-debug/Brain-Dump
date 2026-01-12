// Vercel Serverless Function: api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, systemInstruction } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key not configured on server' });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    res.status(200).json({ text });
  } catch (error) {
    res.status(500).json({ error: 'Failed to communicate with Gemini API' });
  }
}
