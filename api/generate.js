
// /api/generate.js (Next.js API Route or Vercel Serverless Function)

export const runtime = 'nodejs'; // Ensure Node.js runtime environment

import { GoogleGenAI, Type } from "@google/genai";

async function getJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body.trim() !== "") {
    try { return JSON.parse(req.body); } catch { /* fallthrough */ }
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "POST 요청만 허용됩니다." });
  }

  const body = await getJsonBody(req);
  if (!body) {
    return res.status(400).json({ error: "요청 본문이 비어있습니다." });
  }

  try {
    const apiKey = process.env.Gemini_API_KEY;
    if (!apiKey) {
      console.error("Gemini_API_KEY가 설정되지 않았습니다.");
      return res.status(500).json({ error: "서버 설정 오류가 발생했습니다." });
    }

    const { name, filledShortcomings } = body;

    if (!name || !filledShortcomings || !Array.isArray(filledShortcomings) || filledShortcomings.length === 0) {
      return res.status(400).json({ error: "이름과 단점을 올바르게 입력해주세요." });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `당신은 학생들을 위한 친절하고 격려하는 AI 상담가입니다. 당신의 임무는 학생이 스스로 인식하는 단점을 긍정적인 강점으로 재해석하고 성장을 위한 실행 가능한 조언을 제공하는 것입니다. 학생의 이름과 단점 목록이 주어지면, 각 단점을 긍정적으로 재구성하고, 그것이 왜 강점이 될 수 있는지 설명하고, 성장을 위한 팁을 제공해야 합니다. 또한 모든 단점을 고려하여 전반적인 핵심 강점을 요약해야 합니다. 항상 정의된 JSON 스키마에 따라 응답을 반환해야 합니다.`;

    const shortcomingsText = filledShortcomings.map((s, i) => `${i + 1}. ${s}`).join('\n');
    const userContent = `학생 이름: ${name}\n학생이 스스로 인식하는 단점:\n${shortcomingsText}`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            strength_summary: {
                type: Type.STRING,
                description: "분석을 바탕으로 학생의 전반적인 핵심 강점을 요약하는 강력한 한 문장."
            },
            results: {
                type: Type.ARRAY,
                description: "각 단점에 대한 분석 결과 배열.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        affirmation: {
                            type: Type.STRING,
                            description: "단점을 강점으로 재구성하는 긍정적인 확언 문장."
                        },
                        explanation: {
                            type: Type.STRING,
                            description: "단점이 어떻게 강점으로 비춰질 수 있는지에 대한 상세한 설명."
                        },
                        growth_tips: {
                            type: Type.ARRAY,
                            description: "개인적 성장을 위한 실행 가능한 팁 목록.",
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
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userContent,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    let jsonStr = response.text.trim();
    if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
    } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
    }

    const resultJson = JSON.parse(jsonStr);
    return res.status(200).json(resultJson);

  } catch (error) {
    console.error("Gemini API 호출 중 오류 발생:", error);
    return res.status(500).json({ error: "분석 생성 중 오류가 발생했습니다.", details: error.message });
  }
}
