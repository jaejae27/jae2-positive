
import { GoogleGenAI, Type } from "@google/genai";

// This function acts as a serverless function handler (e.g., on Vercel).
export default async (req, res) => {
    // 1. Basic Request Validation
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'POST 요청만 허용됩니다.' });
    }
    if (!req.body) {
        return res.status(400).json({ error: '요청 본문이 비어있습니다. 데이터를 전송했는지 확인해주세요.' });
    }

    try {
        // 2. API Key Configuration Check
        if (!process.env.API_KEY) {
            console.error('API_KEY is not set in environment variables.');
            return res.status(500).json({ 
                error: '서버 설정에 문제가 발생했습니다. 관리자에게 문의해주세요.',
                details: 'API key is not configured on the server.' 
            });
        }

        const { name, filledShortcomings } = req.body;

        // 3. Input Payload Validation
        if (!name || !filledShortcomings || !Array.isArray(filledShortcomings) || filledShortcomings.length === 0) {
            return res.status(400).json({ 
                error: '이름과 단점 내용을 올바르게 입력해주세요.',
                details: 'Name and shortcomings are required.'
            });
        }
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const userPrompt = `당신은 세상에서 가장 따뜻한 마음을 가진 초등학생 전문 심리 상담가이자 긍정 코치입니다. 학생이 스스로의 단점이라고 생각하는 부분을 세상에 하나뿐인 특별한 강점으로 바꾸어주는 놀라운 능력을 가지고 있습니다. 학생의 마음에 깊이 공감하며, 마치 바로 옆에서 다정하게 이야기해주는 것처럼, 매우 상세하고 풍부한 설명으로 아이에게 자신감과 희망을 불어넣어 주세요. 모든 답변은 학생의 눈높이에 맞춰, 쉽고 친절하며, 가슴 따뜻해지는 희망적인 말투로 작성해야 합니다.

다음은 학생 정보와 스스로 생각하는 단점 목록입니다. 각 단점을 분석하여 JSON 형식으로 결과를 제공해주세요.

[학생 정보]
- 이름: ${name}
- 단점: ${JSON.stringify(filledShortcomings)}

[출력 지침]
- 'strength_summary': 학생의 핵심 강점에 대한 간결하고 희망적인 한 문장 요약입니다.
- 'results': 각 단점에 대한 분석 결과 객체들의 배열입니다.
  - 'affirmation': 단점을 긍정적으로 재해석한 짧은 확언 문구입니다.
  - 'explanation': 단점이 왜 특별한 강점이 될 수 있는지, 학생의 이름을 부르며 최소 3문장 이상으로 길고 상세하며 따뜻하게 설명해주세요.
  - 'growth_tips': 이 새로운 강점을 더 키울 수 있는, 구체적이고 실행 가능한 간단한 미션 3가지를 담은 문자열 배열입니다.
`;
        
        // 4. AI Model Call using responseSchema for fast, reliable, structured JSON output
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        strength_summary: {
                            type: Type.STRING,
                            description: "학생의 핵심 강점에 대한 간결하고 희망적인 요약입니다."
                        },
                        results: {
                            type: Type.ARRAY,
                            description: "각 단점에 대한 분석 결과 배열입니다.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    affirmation: {
                                        type: Type.STRING,
                                        description: "단점과 관련된 짧고 긍정적인 확언입니다."
                                    },
                                    explanation: {
                                        type: Type.STRING,
                                        description: "단점이 어떻게 강점으로 비춰질 수 있는지에 대한 상세하고 따뜻하며, 학생의 이름을 부르는 3문장 이상의 긴 설명입니다."
                                    },
                                    growth_tips: {
                                        type: Type.ARRAY,
                                        description: "학생이 이 강점을 키울 수 있는 구체적이고 실행 가능한 간단한 미션 3가지입니다.",
                                        items: {
                                            type: Type.STRING
                                        }
                                    }
                                },
                                required: ["affirmation", "explanation", "growth_tips"]
                            }
                        }
                    },
                    required: ["strength_summary", "results"]
                },
                thinkingConfig: { thinkingBudget: 0 },
            },
        });
        
        const jsonText = response.text;
        
        if (!jsonText) {
             throw new Error("AI model returned an empty response.");
        }

        // 5. Parse Response (should be clean JSON now)
        let data;
        try {
            data = JSON.parse(jsonText);
        } catch (parseError) {
            console.error('Failed to parse JSON from AI response:', jsonText);
            throw new Error("AI model returned data in an invalid format (JSON parsing failed).");
        }
        
        // 6. Data Structure Validation (still good to have as a safeguard)
        const { strength_summary, results } = data;
        if (
            !strength_summary ||
            !results ||
            !Array.isArray(results) ||
            results.length === 0 ||
            results.some(item => !item.affirmation || !item.explanation || !item.growth_tips || !Array.isArray(item.growth_tips))
        ) {
            console.error('Invalid data structure from AI:', JSON.stringify(data, null, 2));
            throw new Error('AI 분석 결과가 비어있거나 올바르지 않습니다.');
        }

        // 7. Success Response
        res.status(200).json(data);

    } catch (error) {
        // 8. Centralized and Enhanced Error Handling
        console.error('Error in /api/generate:', error);
        
        let userMessage = '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        const details = error.message || String(error);

        // Customize user message based on the nature of the error
        if (details.includes("API key not valid")) {
            userMessage = '서버 인증에 실패했습니다. 관리자에게 문의해주세요.';
        } else if (details.includes("invalid format")) {
            userMessage = 'AI가 생성한 응답의 형식이 올바르지 않습니다. 다시 시도해주세요.';
        } else if (details.includes("empty response")) {
            userMessage = 'AI로부터 응답을 받지 못했습니다. 잠시 후 다시 시도해주세요.';
        } else if (details.includes('AI 분석 결과가 비어있거나 올바르지 않습니다.')) {
            userMessage = 'AI 분석 결과가 비어있거나 올바르지 않습니다.';
        } else if (error.status === 429 || details.includes("429")) { // For rate limiting
            userMessage = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
        }
        
        res.status(500).json({ 
            error: userMessage,
            details: details 
        });
    }
};
