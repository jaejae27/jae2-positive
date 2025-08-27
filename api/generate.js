// /api/generate.ts (Next.js API Route or Vercel Serverless Function)

import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenAI, Type } from "@google/genai";

// ---- 유틸: Body 안전 파싱 (Edge/Node 런타임 모두 대응) ----
async function getJsonBody(req: NextApiRequest): Promise<any> {
  // Next(Node) 런타임: req.body 가 이미 객체일 가능성 높음
  if (req.body && typeof req.body === "object") return req.body;
  // 문자열로 온 경우
  if (typeof req.body === "string" && req.body.trim() !== "") {
    try { return JSON.parse(req.body); } catch { /* fallthrough */ }
  }
  // 혹시 모를 Raw body 대응 (ex: Edge, 커스텀 핸들러)
  try {
    // @ts-ignore - 일부 런타임에서 req.json 지원
    if (typeof req.json === "function") return await (req as any).json();
  } catch { /* ignore */ }

  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) 메서드 체크
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "POST 요청만 허용됩니다." });
  }

  // 2) 본문 파싱
  const body = await getJsonBody(req);
  if (!body) {
    return res.status(400).json({
      error: "요청 본문이 비어있습니다. 데이터를 전송했는지 확인해주세요."
    });
  }

  try {
    // 3) API Key 확인 (SDK 권장명: GOOGLE_API_KEY)
    const apiKey = process.env.GOOGLE_API_KEY || process.env.API_KEY; // 둘 다 시도
    if (!apiKey) {
      console.error("GOOGLE_API_KEY is not set.");
      return res.status(500).json({
        error: "서버 설정에 문제가 발생했습니다. 관리자에게 문의해주세요.",
        details: "API key is not configured on the server."
      });
    }

    const { name, filledShortcomings } = body;

    // 4) 입력값 검증
    if (
      !name ||
      !filledShortcomings ||
      !Array.isArray(filledShortcomings) ||
      filledShortcomings.length === 0
    ) {
      return res.status(400).json({
        error: "이름과 단점 내용을 올바르게 입력해주세요.",
        details: "Name and shortcomings are required."
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // 5) 프롬프트 생성
    const userPrompt = `
Task: Transform a lis
