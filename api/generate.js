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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY가 설정되지 않았습니다.");
      return res.status(500).json({ error: "서버 설정 오류가 발생했습니다." });
    }

    const { name, filledShortcomings } = body;

    if (!name || !filledShortcomings || !Array.isArray(filledShortcomings) || filledShortcomings.length === 0) {
      return res.status(400).json({ error: "이름과 단점을 올바르게 입력해주세요." });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `당신은 청소년 심리 분석 전문가이자 따뜻한 조언가입니다. 당신의 임무는 학생이 스스로 생각하는 단점을 깊이 있게 분석하여, 그 안에 숨겨진 잠재력과 강점을 발견해주는 것입니다. 마치 한 편의 개인 맞춤 심리 분석 보고서를 작성하듯이, 각 단점을 긍정적인 특성으로 재해석해주세요.

결과는 반드시 다음 지침을 따라 작성해야 합니다:
1.  **전문성**: 심리학적 용어를 사용하되, 중고등학생이 쉽게 이해할 수 있도록 친절하고 구체적인 예시를 들어 설명해주세요.
2.  **깊이 있는 분석 (explanation)**: 'explanation' 항목은 최소 3~4문장 이상으로 풍부하고 상세하게 작성해주세요. 왜 그 단점이 특정 상황에서는 오히려 강점이 될 수 있는지, 어떤 잠재력을 가지고 있는지 심층적으로 분석해야 합니다. 학생이 스스로를 새롭고 긍정적인 시각으로 바라볼 수 있도록 설득력 있게 설명해주세요.
3.  **실용적인 조언 (growth_tips)**: 'growth_tips'는 구체적이고 실천 가능한 행동 지침을 2~3가지 제안해주세요. 학생들이 자신의 강점을 더 잘 활용하고 발전시킬 수 있는 현실적인 방법이어야 합니다.
4.  **핵심 강점 요약 (strength_summary)**: 모든 분석을 종합하여, 학생의 가장 빛나는 핵심 강점을 감동적이고 힘이 되는 한 문장으로 요약해주세요.
5.  **어조**: 학생에게 직접 말을 거는 것처럼 친근하고 격려하는 말투를 사용해주세요. (예: "${name}님은...", "...할 수 있을 거예요.")

항상 정의된 JSON 스키마에 따라 응답을 반환해야 합니다.`;

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
                            description: "단점이 어떻게 강점으로 비춰질 수 있는지에 대한 상세하고 공감적인 설명입니다. 최소 3~4문장 이상으로, 긍정적인 관점에서 깊이 있게 서술해주세요."
                        },
                        growth_tips: {
                            type: Type.ARRAY,
                            description: "개인적 성장을 위한 실행 가능한 팁 목록. (2-3개)",
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