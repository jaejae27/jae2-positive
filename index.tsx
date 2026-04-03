
import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import { GoogleGenAI, Type } from "@google/genai";

const App = () => {
  const [page, setPage] = useState(1);
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [shortcomings, setShortcomings] = useState([""]);
  const [affirmations, setAffirmations] = useState<{affirmation: string, keyword: string}[]>([]);
  const [explanations, setExplanations] = useState<string[]>([]);
  const [growthTips, setGrowthTips] = useState<string[]>([]);
  const [strengthSummary, setStrengthSummary] = useState("");
  const [currentExplanationIndex, setCurrentExplanationIndex] = useState(0);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [energyName, setEnergyName] = useState("");
  const [template, setTemplate] = useState({
    bg: "#FFD9FA",
    font: "#333333",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const totalPages = 6;
  const progress = (page / totalPages) * 100;

  const handleNext = () => setPage(page + 1);
  const handleBack = () => setPage(page - 1);

  const validateAndProceed = (validationFn: () => boolean) => {
    setError("");
    if (validationFn()) {
      handleNext();
    }
  };
  
  const resetApp = () => {
      setPage(1);
      setStudentId("");
      setName("");
      setShortcomings([""]);
      setAffirmations([]);
      setExplanations([]);
      setGrowthTips([]);
      setStrengthSummary("");
      setCurrentExplanationIndex(0);
      setSelectedKeywords([]);
      setEnergyName("");
      setTemplate({ bg: "#FFD9FA", font: "#333333" });
      setLoading(false);
      setError("");
  }


  const renderPage = () => {
    switch (page) {
      case 1:
        return (
          <UserInfoPage
            studentId={studentId}
            setStudentId={setStudentId}
            name={name}
            setName={setName}
            error={error}
            onNext={() => validateAndProceed(() => {
              if (!studentId.trim() || !name.trim()) {
                setError("학번과 이름을 모두 입력해주세요.");
                return false;
              }
              return true;
            })}
          />
        );
      case 2:
        return (
          <TemplatePage
            template={template}
            setTemplate={setTemplate}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <ShortcomingsPage
            shortcomings={shortcomings}
            setShortcomings={setShortcomings}
            name={name}
            setAffirmations={setAffirmations}
            setExplanations={setExplanations}
            setGrowthTips={setGrowthTips}
            setStrengthSummary={setStrengthSummary}
            setLoading={setLoading}
            setError={setError}
            onNext={handleNext}
            loading={loading}
            error={error}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <ExplanationPage
            name={name}
            explanations={explanations}
            shortcomings={shortcomings}
            currentExplanationIndex={currentExplanationIndex}
            setCurrentExplanationIndex={setCurrentExplanationIndex}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
            <ModifierSelectionPage
                name={name}
                affirmations={affirmations}
                selectedKeywords={selectedKeywords}
                setSelectedKeywords={setSelectedKeywords}
                setEnergyName={setEnergyName}
                error={error}
                setError={setError}
                onNext={() => validateAndProceed(() => {
                    if(selectedKeywords.length < 3){
                        setError("3개 이상의 수식어를 선택해주세요.");
                        return false;
                    }
                    return true;
                })}
                onBack={handleBack}
            />
        );
      case 6:
        return (
          <FinalCardPage
            studentId={studentId}
            name={name}
            template={template}
            affirmations={affirmations.map(a => a.affirmation)}
            strengthSummary={strengthSummary}
            energyName={energyName}
            growthTips={growthTips}
            onRestart={resetApp}
            onBack={handleBack}
          />
        );
      default:
        return <div>잘못된 페이지입니다.</div>;
    }
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1 className="app-title">✨ 긍정 에너지 발전소</h1>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}>
            {progress > 0 && `${Math.round(progress)}%`}
          </div>
        </div>
        <p className="progress-text">긍정 에너지 충전중...</p>
      </div>
      {renderPage()}
    </div>
  );
};

const UserInfoPage = ({ studentId, setStudentId, name, setName, onNext, error }) => (
    <div className="page">
        <h2>⚡<br />오늘의 긍정 에너지 채우기</h2>
        <p>긍정 에너지를 충전하기 위한 첫 번째 단계입니다.</p>
        <div className="input-group">
            <label htmlFor="studentId">학번</label>
            <input
                type="text"
                inputMode="numeric"
                id="studentId"
                placeholder="예: 10132"
                value={studentId}
                onChange={(e) => {
                    // 학번에는 숫자만 입력되도록 처리
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                        setStudentId(value);
                    }
                }}
            />
        </div>
        <div className="input-group">
            <label htmlFor="name">이름</label>
            <input
                type="text"
                id="name"
                placeholder="예: 홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button className="btn" onClick={onNext} disabled={!studentId.trim() || !name.trim()}>
            다음
        </button>
    </div>
);

const TemplatePage = ({ template, setTemplate, onNext, onBack }) => {
    const templates = [
        { name: "솜사탕 핑크", bg: "#FFD9FA", emoji: "🍬" },
        { name: "레몬크림", bg: "#FAF4C0", emoji: "🍋" },
        { name: "구름하늘", bg: "#D4F4FA", emoji: "☁️" },
        { name: "바닐라민트", bg: "#CEFBC9", emoji: "🌿" },
        { name: "라벤더 소다", bg: "#E8D9FF", emoji: "🦄" },
        { name: "조약돌 그레이", bg: "#EAEAEA", emoji: "🗿" },
    ];
    
    return (
        <div className="page">
            <h2>🎨 템플릿 선택하기</h2>
            <p>카드의 배경과 글자색을 골라보세요.</p>
            <div className="template-container">
                {templates.map(t => (
                    <div
                        key={t.name}
                        className={`template-card ${template.bg === t.bg ? 'selected' : ''}`}
                        style={{ backgroundColor: t.bg }}
                        onClick={() => setTemplate({ bg: t.bg, font: '#333333' })}
                    >
                        <div className="emoji">{t.emoji}</div>
                        <div>{t.name}</div>
                    </div>
                ))}
            </div>
            <p>또는, 직접 색상을 선택해보세요!</p>
            <div className="color-picker-container">
                <div className="color-picker-group">
                    <label htmlFor="bg-color">배경색</label>
                    <input type="color" id="bg-color" value={template.bg} onChange={e => setTemplate({...template, bg: e.target.value})} />
                </div>
                <div className="color-picker-group">
                    <label htmlFor="font-color">글자색</label>
                    <input type="color" id="font-color" value={template.font} onChange={e => setTemplate({...template, font: e.target.value})} />
                </div>
            </div>
            <div className="button-group">
                <button className="btn btn-secondary" onClick={onBack}>이전</button>
                <button className="btn" onClick={onNext}>다음</button>
            </div>
        </div>
    );
};

const ShortcomingsPage = ({
  shortcomings,
  setShortcomings,
  name,
  setAffirmations,
  setExplanations,
  setGrowthTips,
  setStrengthSummary,
  setLoading,
  setError,
  onNext,
  loading,
  error,
  onBack,
}) => {
  const [loadingMessage, setLoadingMessage] = useState("에너지 생성중...");

  useEffect(() => {
    let intervalId = null;
    if (loading) {
      const messages = [
        "AI 분석 시스템에 연결하고 있어요...",
        "입력하신 단어를 정밀하게 분석 중입니다...",
        "숨겨진 강점의 조각들을 찾고 있어요.",
        "긍정 에너지로 변환할 준비를 하고 있어요!",
        "데이터를 멋진 카드로 만들고 있습니다...",
        "거의 다 됐어요! 잠시만 기다려주세요.",
      ];
      let messageIndex = 0;
      setLoadingMessage(messages[messageIndex]);

      intervalId = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setLoadingMessage(messages[messageIndex]);
      }, 2000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [loading]);

  const handleShortcomingChange = (index, value) => {
    const newShortcomings = [...shortcomings];
    newShortcomings[index] = value;
    setShortcomings(newShortcomings);
  };

  const addShortcoming = () => {
    if (shortcomings.length < 3) {
      setShortcomings([...shortcomings, ""]);
    }
  };

  const removeShortcoming = (index) => {
    if (shortcomings.length > 1) {
      const newShortcomings = shortcomings.filter((_, i) => i !== index);
      setShortcomings(newShortcomings);
    }
  };

  const handleGenerate = async () => {
    setError("");
    const filledShortcomings = shortcomings.filter(s => s.trim() !== "");
    if (filledShortcomings.length === 0) {
      setError("단점을 하나 이상 입력해주세요.");
      return;
    }

    for (const shortcoming of filledShortcomings) {
        if (/^(\s*([ㄱ-ㅎㅏ-ㅣ])\2{2,}\s*)+$/.test(shortcoming) || /^(\s*([a-zA-Z])\2{2,}\s*)+$/.test(shortcoming)) {
           setError("의미있는 문장으로 작성해주세요. (예: ㅋㅋㅋ, ㅎㅎㅎ 등은 안 돼요)");
           return;
        }
        const inappropriateWords = ["욕", "씨발", "죽어", "병신", "바보", "멍청이", "때리", "괴롭"];
        if(inappropriateWords.some(word => shortcoming.includes(word))){
            setError("부적절한 에너지가 감지되었습니다. 욕설, 폭력, 비방의 글은 작성할 수 없습니다.");
            return;
        }
    }

    setLoading(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API 키가 설정되지 않았습니다. AI Studio 설정에서 API 키를 확인해주세요.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `당신은 청소년 심리 분석 전문가이자 따뜻한 조언가입니다. 당신의 임무는 학생이 스스로 생각하는 단점을 깊이 있게 분석하여, 그 안에 숨겨진 잠재력과 강점을 발견해주는 것입니다. 마치 한 편의 개인 맞춤 심리 분석 보고서를 작성하듯이, 각 단점을 긍정적인 특성으로 재해석해주세요.

결과는 반드시 다음 지침을 따라 작성해야 합니다:
1.  **전문성**: 심리학적 용어를 사용하되, 중고등학생이 쉽게 이해할 수 있도록 친절하고 구체적인 예시를 들어 설명해주세요.
2.  **깊이 있는 분석 (explanation)**: 'explanation' 항목은 최소 3~4문장 이상으로 풍부하고 상세하게 작성해주세요. 왜 그 단점이 특정 상황에서는 오히려 강점이 될 수 있는지, 어떤 잠재력을 가지고 있는지 심층적으로 분석해야 합니다. 학생이 스스로를 새롭고 긍정적인 시각으로 바라볼 수 있도록 설득력 있게 설명해주세요.
3.  **실용적인 조언 (growth_tips)**: 'growth_tips'는 구체적이고 실천 가능한 행동 지침을 2~3가지 제안해주세요. 학생들이 자신의 강점을 더 잘 활용하고 발전시킬 수 있는 현실적인 방법이어야 합니다.
4.  **핵심 강점 요약 (strength_summary)**: 모든 분석을 종합하여, 학생의 가장 빛나는 핵심 강점을 감동적이고 힘이 되는 한 문장으로 요약해주세요.
5.  **어조**: 학생에게 직접 말을 거는 것처럼 친근하고 격려하는 말투를 사용해주세요. (예: "${name}님은...", "...할 수 있을 거예요.")
6.  **키워드 (keyword)**: 각 강점을 대표하는 핵심 단어(명사형)를 하나씩 추출해주세요. (예: "호기심", "신중함", "열정", "배려")

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
                          keyword: {
                              type: Type.STRING,
                              description: "해당 강점을 대표하는 짧은 핵심 키워드 (예: 호기심, 신중함)."
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
                      required: ["affirmation", "keyword", "explanation", "growth_tips"]
                  }
              }
          },
          required: ["strength_summary", "results"]
      };

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userContent,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
      });

      let jsonStr = response.text.trim();
      if (jsonStr.startsWith("```json")) {
          jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
      } else if (jsonStr.startsWith("```")) {
          jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
      }

      const data = JSON.parse(jsonStr);

      if (typeof data !== 'object' || data === null) {
        throw new Error("AI로부터 유효한 분석 결과를 받지 못했습니다. 다시 시도해주세요.");
      }
      
      const validResults = (data.results || []).filter(r => r && typeof r === 'object');
      const summary = data.strength_summary || `${name}님은 무한한 가능성을 가진 멋진 사람입니다.`;

      if (validResults.length === 0) {
          throw new Error("AI가 강점을 분석하지 못했어요. 조금 다른 단어로 다시 시도해볼까요?");
      }
      
      setAffirmations(validResults.map(r => ({
          affirmation: r.affirmation || "긍정적인 마음을 가지세요.",
          keyword: r.keyword || "강점"
      })));
      setExplanations(validResults.map(r => r.explanation || "모든 경험은 성장의 기회입니다."));
      setGrowthTips(validResults.flatMap(r => r.growth_tips || []));
      setStrengthSummary(summary);
      onNext();

    } catch (e: any) {
      console.error("긍정 확언 생성 중 오류:", e);
      setError(`에너지 생성 중 오류가 발생했습니다: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>💪 단점을 강점으로 바꾸기</h2>
      <p>{name}님, 스스로 부족하다고 생각하는 점은 무엇인가요? (최대 3개)</p>
      
      <div className="tips">
        <h3>💡 작성 TIP</h3>
        <ul>
          <li>솔직하게 작성할수록 더 정확한 분석이 가능해요.</li>
          <li>'산만하다', '목소리가 작다' 처럼 구체적으로 적어주세요.</li>
        </ul>
      </div>

      <div className="input-group">
        {shortcomings.map((shortcoming, index) => (
          <div key={index} className="shortcoming-item">
            <input
              type="text"
              placeholder={`단점 ${index + 1}`}
              value={shortcoming}
              onChange={(e) => handleShortcomingChange(index, e.target.value)}
              disabled={loading}
            />
            {shortcomings.length > 1 && !loading && (
              <button className="btn-remove" onClick={() => removeShortcoming(index)}>
                &times;
              </button>
            )}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p className="loading-message">{loadingMessage}</p>
        </div>
      ) : (
        <>
          {shortcomings.length < 3 && (
            <button className="btn btn-secondary" onClick={addShortcoming}>
              단점 추가하기
            </button>
          )}

          {error && (
            <div className="error-container">
                <p className="error-message">{error}</p>
                <button className="btn-copy-error" onClick={() => navigator.clipboard.writeText(error)}>
                    오류 복사
                </button>
            </div>
          )}
        </>
      )}
      
      <div className="button-group">
          <button className="btn btn-secondary" onClick={onBack} disabled={loading}>이전</button>
          <button className="btn" onClick={handleGenerate} disabled={loading || shortcomings.every(s => s.trim() === '')}>
              강점 분석하기
          </button>
      </div>
    </div>
  );
};

const ExplanationPage = ({
    name,
    explanations,
    shortcomings,
    currentExplanationIndex,
    setCurrentExplanationIndex,
    onNext,
    onBack,
}) => {
  const handleNextExplanation = () => {
    if (currentExplanationIndex < explanations.length - 1) {
      setCurrentExplanationIndex(currentExplanationIndex + 1);
    } else {
      onNext();
    }
  };

  return (
    <div className="page">
      <h2>🔬 {name}님의 강점 보고서</h2>
      <p>입력한 단점이 어떻게 멋진 강점이 되는지 확인해보세요.</p>
      
      <div className="explanation-box">
          <h4>'{shortcomings[currentExplanationIndex]}'의 재해석</h4>
          <p className="explanation-text">
            {explanations[currentExplanationIndex]}
          </p>
      </div>

      <p>{currentExplanationIndex + 1} / {explanations.length}</p>

      <div className="button-group">
          <button className="btn btn-secondary" onClick={onBack}>이전</button>
          <button className="btn" onClick={handleNextExplanation}>
            {currentExplanationIndex < explanations.length - 1 ? '다음 분석 보기' : '분석 완료!'}
          </button>
      </div>
    </div>
  );
};

const ModifierSelectionPage = ({ name, affirmations, selectedKeywords, setSelectedKeywords, setEnergyName, onNext, error, setError, onBack }) => {
    const [generating, setGenerating] = useState(false);

    // 중학생들이 이해하기 쉬운 기본 수식어 리스트
    const baseKeywords = [
        "밝은", "따뜻한", "단단한", "빛나는", "솔직한", "용기있는", "섬세한", "열정적인", 
        "차분한", "창의적인", "믿음직한", "다정한", "당당한", "지혜로운", "활기찬",
        "성실한", "책임감있는", "논리적인", "신중한", "공감하는", "주도적인"
    ];

    // AI가 추출한 키워드와 기본 키워드 합치기 (중복 제거)
    const allKeywords = Array.from(new Set([...affirmations.map(a => a.keyword), ...baseKeywords]));

    const toggleKeyword = (keyword) => {
        setError("");
        if (selectedKeywords.includes(keyword)) {
            setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
        } else {
            setSelectedKeywords([...selectedKeywords, keyword]);
        }
    };

    const handleNext = async () => {
        if (selectedKeywords.length < 3) {
            setError("3개 이상의 수식어를 선택해주세요.");
            return;
        }

        setGenerating(true);
        try {
            const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
            if (!apiKey) throw new Error("API 키가 없습니다.");

            const ai = new GoogleGenAI({ apiKey });
            
            const prompt = `사용자가 선택한 세 가지 이상의 강점 키워드(${selectedKeywords.join(", ")})를 조합하여, 나만의 **'긍정 에너지 별명'**을 만들어줘.

[결과물 출력 시 아래의 **[3대 금지 원칙]**을 반드시 지키세요]
1. 조사의 중복 금지: '~을 ~하게'처럼 조사가 겹쳐서 문장이 늘어지는 것을 피하세요.
2. 형용사 나열 금지: '열정적으로 도전하는 당당한'처럼 수식어를 3개 이상 붙이지 마세요. 핵심적인 수식어 1~2개면 충분합니다.
3. 호응 관계 최우선: '행복을 받아들여'와 '에너지'가 문법적으로 매끄럽게 호응하도록 만드세요.

[✅ 추천하는 자연스러운 구조]
- [~한 기질]을 가진 [~하는] 에너지
- [~의 가치]로 [~를 만드는] 에너지
- [~한 마음]으로 [~를 향해 나아가는] 에너지

[예시 (Before & After)]
- (어색) 행복을 기쁘게 받아들여 열정적으로 도전하는 당당한 에너지
- (수정) 즐거운 마음으로 목표를 향해 나아가는 당당한 에너지
- (수정) 사소한 행복을 놓치지 않고 도전으로 잇는 열정 에너지
- (수정) 긍정적인 기운으로 주변을 밝게 물들이는 열린 에너지

[기타 지침]
- 🚫 금지 단어: 엔진, 발전소, 발전기, 연료, 탱크, 기계, 무지개, 구름 (기계적/추상적 표현 금지)
- 톤: 아이들이 멋있다고 느낄만한 '정체성' 위주로 작명하세요.

결과는 오직 생성된 별명 한 줄만 출력해.`;

            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: prompt,
            });

            const generatedName = response.text.trim().replace(/"/g, "");
            setEnergyName(generatedName);
            onNext();
        } catch (e) {
            console.error("페르소나 생성 오류:", e);
            // 실패 시 기본 로직으로 대체
            const fallback = `${selectedKeywords.slice(0, 2).join(" ")} 에너지`;
            setEnergyName(fallback);
            onNext();
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="page">
            <h2>✨ 나만의 에너지 별명 만들기</h2>
            <p>나를 잘 설명하는 수식어를 3개 이상 선택해주세요!</p>
            
            {generating ? (
                <div className="loading-indicator">
                    <div className="spinner"></div>
                    <p className="loading-message">멋진 별명을 만들고 있어요...</p>
                </div>
            ) : (
                <>
                    <div className="keyword-container">
                        {allKeywords.map((keyword, index) => (
                            <button
                                key={index}
                                className={`keyword-btn ${selectedKeywords.includes(keyword) ? 'selected' : ''}`}
                                onClick={() => toggleKeyword(keyword)}
                            >
                                {keyword}
                            </button>
                        ))}
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <div className="button-group">
                        <button className="btn btn-secondary" onClick={onBack}>이전</button>
                        <button className="btn" onClick={handleNext} disabled={selectedKeywords.length < 3}>
                            카드 완성하기
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

const FinalCardPage = ({
  studentId,
  name,
  template,
  affirmations,
  strengthSummary,
  energyName,
  growthTips,
  onRestart,
  onBack,
}) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const downloadCard = () => {
        if (cardRef.current) {
            const cardElement = cardRef.current;
            const clone = cardElement.cloneNode(true) as HTMLElement;

            // Style the clone to be off-screen and fully expanded
            clone.style.position = 'absolute';
            clone.style.left = '-9999px';
            clone.style.top = '0px';
            clone.style.maxHeight = 'none';
            clone.style.overflowY = 'visible';
            // Set a width, as absolute positioning might collapse it
            clone.style.width = `${cardElement.offsetWidth}px`;

            document.body.appendChild(clone);

            html2canvas(clone, { 
                useCORS: true,
                backgroundColor: null,
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `${name}_긍정카드.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }).finally(() => {
                document.body.removeChild(clone);
            });
        }
    };
    
    return (
        <div className="page">
            <h2 className="final-title">🎉 {name}님을 위한 긍정 에너지 카드 완성!</h2>
            <p>완성된 카드를 저장하고 친구들에게 공유해보세요.</p>
            
            <div
                ref={cardRef}
                className="card-container"
                style={{
                    backgroundColor: template.bg,
                    color: template.font,
                }}
            >
                <div className="card-header">
                    <h3 className="card-title">✨ {name}님의 긍정 에너지 카드 ✨</h3>
                    <p className="card-user-info">{studentId} {name}</p>
                </div>
                <div className="card-content">
                    <div className="highlight-box">
                        <h4>🌟 오늘 새롭게 정의된 당신의 정체성</h4>
                        <p className="strength-summary">"{strengthSummary}"</p>
                    </div>

                    <div className="highlight-box">
                        <h4>💖 새롭게 발견한 나의 강점</h4>
                        <ul className="affirmation-list">
                            {affirmations.map((aff, index) => <li key={index}>{aff}</li>)}
                        </ul>
                    </div>
                    
                    <div className="highlight-box">
                        <h4>🚀 나의 성장 미션</h4>
                        <ul className="mission-list">
                            {growthTips.slice(0, 3).map((tip, index) => ( // Show up to 3 for brevity
                                <li key={index} className="mission-item">
                                    <input type="checkbox" id={`mission-${index}`} readOnly checked={false} />
                                    <label htmlFor={`mission-${index}`}>{tip}</label>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="highlight-box">
                        <h4>🔥 나만의 에너지 별명</h4>
                        <div className="energy-name-box">
                            <p className="energy-name-text">{energyName}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="button-group">
                <button className="btn btn-secondary" onClick={onBack}>이전</button>
                <button className="btn" onClick={downloadCard}>카드 저장하기</button>
            </div>
            <button className="btn" onClick={onRestart}>다시 시작하기</button>
        </div>
    );
};


createRoot(document.getElementById("root")!).render(<App />);