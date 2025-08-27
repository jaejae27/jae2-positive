// /api/generate.js (Next.js API Route or Vercel Serverless Function)

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
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY가 설정되지 않았습니다.");
      return res.status(500).json({ error: "서버 설정 오류가 발생했습니다." });
    }

    const { name, filledShortcomings } = body;

    if (!name || !filledShortcomings || !Array.isArray(filledShortcomings) || filledShortcomings.length === 0) {
      return res.status(400).json({ error: "이름과 단점을 올바르게 입력해주세요." });
    }

    const ai = new GoogleGenAI({ apiKey });

    const shortcomingsText = filledShortcomings.map((s, i) => `${i + 1}. ${s}`).join('\n');
    const userPrompt = `당신은 학생들을 위한 친절하고 격려하는 AI 상담가입니다. 학생이 스스로 인식하는 단점을 긍정적인 강점으로 재해석하고 성장을 위한 실행 가능한 조언을 제공하는 임무를 맡고 있습니다.

학생 이름: ${name}
학생이 스스로 인식하는 단점:
${shortcomingsText}

이를 바탕으로 다음 구조를 가진 JSON 응답을 생성해주세요:
1. 'strength_summary': 학생의 전반적인 핵심 강점을 요약하는 강력하고 희망적인 한 문장.
2. 'results' 배열: 제공된 각 단점에 대해 다음을 포함하는 객체를 이 배열에 생성합니다:
   a. 'affirmation': 단점을 강점으로 재구성하는 긍정적인 확언 문장. (예: "저의 꼼꼼한 성격은 저의 철저함과 세심함의 증거입니다.")
   b. 'explanation': 이 인식된 약점이 실제로는 다양한 상황에서 가치 있는 강점인 이유를 설명하는 상세한 문단.
   c. 'growth_tips': 학생이 이 잠재력을 활용하기 위한 2-3가지 구체적이고 실행 가능한 팁 배열.`;

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
      contents: userPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const resultJson = JSON.parse(response.text);
    return res.status(200).json(resultJson);

  } catch (error) {
    console.error("Gemini API 호출 중 오류 발생:", error);
    return res.status(500).json({ error: "분석 생성 중 오류가 발생했습니다.", details: error.message });
  }
}
