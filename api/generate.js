
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

        const systemInstruction = `너는 초등학생의 잠재력을 분석하고 긍정적인 피드백을 제공하는 심리 분석 전문가다. 너의 응답은 반드시 요청된 JSON 형식이어야 하며, 다른 어떤 텍스트도 포함해서는 안 된다.`;

        const contents = `학생 이름: ${name}
분석할 단점 목록: [${filledShortcomings.map(s => `"${s}"`).join(', ')}]

위 단점 목록을 분석하여 다음 규칙에 따라 JSON 객체를 생성해줘.

1.  **결과 구조**: 응답은 반드시 'strength_summary'와 'results' 키를 가진 단일 JSON 객체여야 한다.
2.  **strength_summary**: 모든 강점을 종합하여 이 학생을 한 문장으로 정의하는 명사구. (예: "주변을 깊이 관찰하고 신중하게 생각하는 탐험가")
3.  **results**: 단점 목록 순서에 맞춰 생성된 객체들의 배열.
    *   각 객체는 'affirmation', 'explanation', 'growth_tip' 키를 가진다.
    *   'affirmation': 단점을 강점으로 바꾼 짧고 긍정적인 문장.
    *   'explanation': 강점에 대한 전문적인 톤의 설명. (~입니다, ~합니다 체)
    *   'growth_tip': 강점을 키우기 위한 실천 가능한 짧은 미션.
4.  **중요 규칙**: 응답은 오직 유효한 JSON 코드여야 한다. 코드 블록 마크다운(\`\`\`)이나 다른 설명 텍스트를 절대 포함하지 마라.`;

        // Set headers for streaming the response
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Transfer-Encoding': 'chunked',
            'Connection': 'keep-alive'
        });

        const stream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                thinkingConfig: { thinkingBudget: 0 },
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
