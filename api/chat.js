// Vercel Serverless Function: api/chat.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, systemInstruction, isJson } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Server configuration error: API Key missing' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] }
    };

    // Support for the Strategic Grid JSON mode
    if (isJson) {
        payload.generationConfig = {
            responseMimeType: "application/json"
        };
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ 
                error: data.error?.message || 'Upstream AI Service Error' 
            });
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        res.status(200).json({ text });
    } catch (error) {
        res.status(500).json({ error: 'Communication failure with AI' });
    }
}
