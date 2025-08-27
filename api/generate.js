// /api/generate.js (Vercel/Node serverless, CommonJS)
const { GoogleGenAI, Type } = require("@google/genai");

module.exports = async (req, res) => {
  // 1) 메서드 체크
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // 2) 본문 파싱(문자열/객체 모두 대응)
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch { /* ignore */ }
    }
    if (!body || typeof body !== "object") {
      return res.status(400).json({ error: "Invalid JSON body." });
    }

    const { name, filledShortcomings } = body;

    // 3) 입력 검증
    if (
      !name ||
      !filledShortcomings ||
      !Array.isArray(filledShortcomings) ||
      filledShortcomings.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Name and shortcomings are required." });
    }

    // 4) API 키
    const apiKey = process.env.GOOGLE_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      console.error("API key not configured.");
      return res
        .status(500)
        .json({ error: "API key is not configured on the server." });
    }

    const ai = new GoogleGenAI({ apiKey });

    // 5) 프롬프트
    const systemInstruction =
      "You are a psychological analyst for elementary school students. Your task is to reframe a student's stated shortcomings into positive strengths. You must strictly output JSON that adheres to the provided schema. Do not output anything else.";

    const userPrompt = `Analyze the following student and their shortcomings.
- Student Name: ${name}
- Shortcomings: ${JSON.stringify(filledShortcomings)}

Based on these, generate a strength summary, and for each shortcoming, provide a positive affirmation, a detailed explanation, and a practical growth tip.`;

    // 6) 스키마(Type enum 사용) — 단일 growth_tip(문자열) 버전
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        strength_summary: { type: Type.STRING },
        results: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              affirmation: { type: Type.STRING },
              explanation: { type: Type.STRING },
              growth_tip: { type: Type.STRING },
            },
            required: ["affirmation", "explanation", "growth_tip"],
          },
        },
      },
      required: ["strength_summary", "results"],
    };

    // 7) 모델 호출(스트리밍 비활성화: 한 번에 완성 JSON 받기)
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      systemInstruction,
      contents: userPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema,
        // 생각 토큰 비활성화(선택)
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const jsonText = response.text;
    if (!jsonText || typeof jsonText !== "string" || jsonText.trim() === "") {
      throw new Error("Empty response from model.");
    }

    // 8) 파싱 + 최소 검증
    let data;
    try {
      data = JSON.parse(jsonText);
    } catch (e) {
      console.error("JSON parse failed:", jsonText);
      throw new Error("Model returned invalid JSON.");
    }

    const ok =
      typeof data?.strength_summary === "string" &&
      Array.isArray(data?.results) &&
      data.results.length > 0 &&
      data.results.every(
        (r) =>
          r &&
          typeof r.affirmation === "string" &&
          typeof r.explanation === "string" &&
          typeof r.growth_tip === "string"
      );

    if (!ok) {
      console.error("Schema validation failed:", JSON.stringify(data, null, 2));
      throw new Error("Schema validation failed.");
    }

    // 9) 성공 응답
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in serverless function:", error);
    const msg = String(error?.message || error);

    let userMsg = "An internal server error occurred on the API route.";
    if (msg.includes("API key")) userMsg = "API key configuration error.";
    if (msg.includes("Empty response")) userMsg = "No response from the model.";
    if (msg.includes("invalid JSON")) userMsg = "Model returned invalid JSON.";
    if (msg.includes("Schema validation")) userMsg = "Invalid model output shape.";

    if (!res.headersSent) {
      return res.status(500).json({ error: userMsg, details: msg });
    }
    // 혹시 이미 헤더 보냈으면 안전 종료
    res.end();
  }
};
