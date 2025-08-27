
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

        const userPrompt = `You are an expert psychological analyst for elementary school students, specializing in reframing weaknesses into strengths.
Analyze the student's shortcomings and transform them into positive attributes.
For each shortcoming, provide a positive affirmation, a detailed explanation of it as a strength, and a practical growth tip.
Also provide a concise, uplifting summary of the student's core strengths based on the analysis.

Student Information:
- Name: ${name}
- Shortcomings: ${JSON.stringify(filledShortcomings)}`;
        
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
                                        description: "단점이 어떻게 강점으로 비춰질 수 있는지에 대한 상세한 설명입니다."
                                    },
                                    growth_tip: { 
                                        type: Type.STRING,
                                        description: "학생이 이 강점을 키울 수 있는 실용적이고 실행 가능한 조언입니다."
                                    }
                                },
                                required: ["affirmation", "explanation", "growth_tip"]
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
            results.some(item => !item.affirmation || !item.explanation || !item.growth_tip)
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
