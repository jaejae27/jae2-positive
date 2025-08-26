
const { GoogleGenAI, Type } = require("@google/genai");

// This function acts as a serverless function handler (e.g., on Vercel).
module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { name, filledShortcomings } = req.body;

        // Basic validation on the server side
        if (!name || !filledShortcomings || !Array.isArray(filledShortcomings) || filledShortcomings.length === 0) {
            return res.status(400).json({ error: 'Name and shortcomings are required.' });
        }
        
        // Ensure the API key is configured on the server environment
        if (!process.env.API_KEY) {
            console.error('API_KEY is not set in environment variables.');
            return res.status(500).json({ error: 'API key is not configured on the server.' });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `너의 역할: 너는 초등학생 ${name}의 잠재력을 분석하는 심리 분석 전문가다.

과업:
${name} 학생의 단점 목록(${filledShortcomings.join(', ')})을 바탕으로, 각 단점을 긍정적인 강점으로 재해석하고, ${name} 학생의 종합적인 강점 프로필을 JSON 형식으로 생성한다.

JSON 출력 규칙:
- 최상위 객체는 'strength_summary'와 'results' 키를 포함해야 한다.
- 'strength_summary': 발견된 모든 강점들을 종합하여 ${name} 학생을 설명하는 명사구. 주어는 절대 포함하지 마. 예: '주변을 깊이 관찰하고 신중하게 생각하는 사람'.
- 'results': 입력된 단점 순서대로, 각 단점에 대한 분석 결과를 담은 객체 배열.
  - 각 객체는 'affirmation', 'explanation', 'growth_tip'을 포함해야 한다.
  - 'affirmation': 단점을 강점으로 바꾼 짧고 긍정적인 문장.
  - 'explanation': 심리 검사 결과처럼 전문적인 톤으로(~입니다, ~합니다) 강점을 설명. 예: "당신은 ~한 강점을 가진 사람입니다. 그래서 ~하는 경향이 있습니다."
  - 'growth_tip': 즉시 실천 가능한 짧은 미션. 예: '새로운 친구에게 질문 건네보기'.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 0 },
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        strength_summary: {
                            type: Type.STRING,
                            description: `${name}의 발견된 강점들을 종합하여 설명하는 명사구. '주변을 깊이 관찰하고 신중하게 생각하는 사람'과 같은 형식. 주어를 포함하지 않음.`,
                        },
                        results: {
                            type: Type.ARRAY,
                            description: "각 단점에 대한 긍정적 재해석 결과 목록. 입력된 단점의 순서와 동일해야 합니다.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    affirmation: {
                                        type: Type.STRING,
                                        description: "단점을 강점으로 바꾼 짧고 긍정적인 문장 (예: '당신은 신중한 사람입니다.')",
                                    },
                                    explanation: {
                                        type: Type.STRING,
                                        description: "심리 검사 결과를 해석해주는 전문가처럼, ${name}님의 특성을 분석해서 '당신은 ~한 강점을 가진 사람입니다. 그래서 ~하는 경향이 있습니다.' 와 같은 구조로 설명하는 글. 말투는 '~입니다', '~합니다' 처럼 신뢰감 있고 전문적인 톤을 사용.",
                                    },
                                    growth_tip: {
                                        type: Type.STRING,
                                        description: "발견한 강점을 더 발전시키기 위한 구체적이고 실천 가능한 미션 한 가지. 'OO하기' 또는 'OO해보기' 처럼 매우 짧고 명료한 행동 중심으로 작성해줘.",
                                    },
                                },
                                required: ["affirmation", "explanation", "growth_tip"],
                            },
                        },
                    },
                    required: ["strength_summary", "results"],
                },
            },
        });

        const jsonResponse = JSON.parse(response.text);

        // Send the successful response back to the client
        res.status(200).json(jsonResponse);

    } catch (error) {
        console.error('Error in serverless function:', error);
        // Send a more detailed error message to the client for debugging
        res.status(500).json({ 
            error: 'An internal server error occurred on the API route.',
            details: error.message || String(error)
        });
    }
};
