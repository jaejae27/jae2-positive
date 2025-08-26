
const { GoogleGenAI } = require("@google/genai");

// This function acts as a serverless function handler (e.g., on Vercel).
module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { name, filledShortcomings } = req.body;

        if (!name || !filledShortcomings || !Array.isArray(filledShortcomings) || filledShortcomings.length === 0) {
            return res.status(400).json({ error: 'Name and shortcomings are required.' });
        }
        
        if (!process.env.API_KEY) {
            console.error('API_KEY is not set in environment variables.');
            return res.status(500).json({ error: 'API key is not configured on the server.' });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const systemInstruction = `You are a psychological analyst for elementary school students. Your task is to reframe a student's stated shortcomings into positive strengths. You must strictly output JSON that adheres to the provided schema. Do not output anything else.`;

        const userPrompt = `Analyze the following student and their shortcomings.
- Student Name: ${name}
- Shortcomings: ${JSON.stringify(filledShortcomings)}

Based on these, generate a strength summary, and for each shortcoming, provide a positive affirmation, a detailed explanation, and a practical growth tip.`;

        // This schema is optimized by removing descriptions to reduce token count.
        const responseSchema = {
            type: "OBJECT",
            properties: {
                strength_summary: { type: "STRING" },
                results: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            affirmation: { type: "STRING" },
                            explanation: { type: "STRING" },
                            growth_tip: { type: "STRING" }
                        },
                        required: ["affirmation", "explanation", "growth_tip"]
                    }
                }
            },
            required: ["strength_summary", "results"]
        };
        
        // Set headers for streaming the response
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Transfer-Encoding': 'chunked',
            'Connection': 'keep-alive'
        });

        const stream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction,
            contents: userPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        // Stream the response chunks to the client
        for await (const chunk of stream) {
            res.write(chunk.text);
        }

        // End the response stream
        res.end();

    } catch (error) {
        console.error('Error in serverless function:', error);
        if (!res.headersSent) {
             res.status(500).json({ 
                error: 'An internal server error occurred on the API route.',
                details: error.message || String(error)
            });
        } else {
            // If headers are sent, we can't send a new status code.
            // We just end the response. The client will likely fail parsing incomplete JSON.
            res.end();
        }
    }
};
