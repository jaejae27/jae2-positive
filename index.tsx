
import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI, Type } from "@google/genai";
import html2canvas from "html2canvas";

const App = () => {
  const [page, setPage] = useState(1);
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [shortcomings, setShortcomings] = useState([""]);
  const [affirmations, setAffirmations] = useState<string[]>([]);
  const [explanations, setExplanations] = useState<string[]>([]);
  const [growthTips, setGrowthTips] = useState<string[]>([]);
  const [strengthSummary, setStrengthSummary] = useState("");
  const [currentExplanationIndex, setCurrentExplanationIndex] = useState(0);
  const [friendName, setFriendName] = useState("");
  const [friendMessage, setFriendMessage] = useState("");
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
      setFriendName("");
      setFriendMessage("");
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
            <FriendMessagePage
                name={name}
                friendName={friendName}
                setFriendName={setFriendName}
                friendMessage={friendMessage}
                setFriendMessage={setFriendMessage}
                error={error}
                onNext={() => validateAndProceed(() => {
                    if(!friendName.trim() || !friendMessage.trim()){
                        setError("친구의 이름과 응원 메시지를 모두 입력해주세요.");
                        return false;
                    }
                    if (/^(\s*([ㄱ-ㅎㅏ-ㅣ])\2{1,}\s*)+$/.test(friendMessage) || /^(\s*([a-zA-Z])\2{1,}\s*)+$/.test(friendMessage)) {
                       setError("의미있는 문장으로 작성해주세요.");
                       return false;
                    }
                    const inappropriateWords = ["욕", "씨발", "죽어", "병신", "바보", "멍청이", "때리", "괴롭"];
                    if(inappropriateWords.some(word => friendMessage.includes(word))){
                        setError("부적절한 에너지가 감지되었습니다. 욕설, 폭력, 비방의 글은 작성할 수 없습니다.");
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
            affirmations={affirmations}
            friendName={friendName}
            friendMessage={friendMessage}
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
        "긍정 에너지 주파수를 맞추고 있어요...",
        "강점 원석을 탐색하고 있어요...",
        "AI 분석가들이 열심히 토론하고 있어요...",
        "부정적인 생각을 긍정 회로로 변환 중...",
        "거의 다 됐어요! 멋진 결과가 곧 나타납니다.",
      ];
      let messageIndex = 0;
      setLoadingMessage(messages[messageIndex]); // Set initial message immediately

      intervalId = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setLoadingMessage(messages[messageIndex]);
      }, 2500);
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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const userPrompt = `당신은 세상에서 가장 따뜻한 마음을 가진 초등학생 전문 심리 상담가이자 긍정 코치입니다. 학생이 스스로의 단점이라고 생각하는 부분을 세상에 하나뿐인 특별한 강점으로 바꾸어주는 놀라운 능력을 가지고 있습니다. 학생의 마음에 깊이 공감하며, 마치 바로 옆에서 다정하게 이야기해주는 것처럼, 매우 상세하고 풍부한 설명으로 아이에게 자신감과 희망을 불어넣어 주세요. 모든 답변은 학생의 눈높이에 맞춰, 쉽고 친절하며, 가슴 따뜻해지는 희망적인 말투로 작성해야 합니다.

다음은 학생 정보와 스스로 생각하는 단점 목록입니다. 각 단점을 분석하여 긍정적인 확언, 강점으로의 재해석, 그리고 성장을 위한 구체적인 미션 3가지를 제공해주세요. 또한, 전체 분석을 바탕으로 학생의 핵심 강점을 요약해주세요.

[분석 예시]
- 단점: "산만하다"
- 긍정 확언: "나는 호기심이 많고 창의적인 탐험가야!"
- 강점 재해석: "우리 ${name}(이)가 '산만하다'고 느끼는 건, 사실 남들보다 훨씬 더 넓은 세상을 보고 있다는 멋진 신호예요! 마치 머릿속에 수많은 안테나가 있어서, 주변의 재미있는 정보들을 쏙쏙 수집하는 탐험가 같달까요? 한 가지 길만 보는 친구들과 달리, 우리 ${name}(이)는 여러 갈래의 길을 동시에 발견하고, 그 길들을 연결해서 아무도 생각지 못한 새로운 지도를 그려낼 수 있는 특별한 능력을 가졌어요. 그래서 친구들을 깜짝 놀라게 할 기발한 아이디어를 떠올리거나, 복잡한 문제도 여러 각도에서 보며 해결의 실마리를 찾아내는 데 아주 유리하답니다. 이건 정말 귀하고 소중한 재능이에요!"
- 성장 미션: ["'나만의 아이디어 수첩'에 생각을 기록하기", "뽀모도로 타이머로 25분 집중 놀이하기", "주말마다 새로운 장소나 책 탐험하기"]

[학생 정보]
- 이름: ${name}
- 단점: ${JSON.stringify(filledShortcomings)}

이제 위 예시와 같이, 주어진 학생의 단점들을 분석하여 JSON 형식으로 결과를 제공해주세요. 'explanation' 부분은 예시처럼 학생의 이름을 부르며, 최소 3문장 이상의 길고 상세하며 따뜻한 내용으로 작성해주세요. 'growth_tips'는 구체적이면서도 간단하게 요약된 문장으로 반드시 3가지씩 제안해야 합니다.`;

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
         throw new Error("AI 모델이 빈 응답을 반환했습니다.");
      }
      
      let data;
      try {
          data = JSON.parse(jsonText);
      } catch (parseError) {
          console.error('AI 응답에서 JSON 파싱 실패:', jsonText);
          throw new Error("AI 모델이 유효하지 않은 형식의 데이터를 반환했습니다.");
      }

      if (!data.strength_summary || !data.results || data.results.length === 0 || !data.results.every(r => r.growth_tips && Array.isArray(r.growth_tips))) {
        throw new Error("AI 분석 결과가 비어있거나 올바르지 않습니다. 다시 시도해주세요.");
      }
      
      setAffirmations(data.results.map(r => r.affirmation));
      setExplanations(data.results.map(r => r.explanation));
      setGrowthTips(data.results.flatMap(r => r.growth_tips));
      setStrengthSummary(data.strength_summary);
      onNext();

    } catch (e) {
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

const FriendMessagePage = ({ name, friendName, setFriendName, friendMessage, setFriendMessage, onNext, error, onBack }) => (
    <div className="page">
        <h2>💌 친구의 응원 메시지</h2>
        <p>{name}님을 응원하는 친구의 메시지를 담아 카드를 완성해보세요!</p>
        <div className="input-group">
            <label htmlFor="friendName">친구 이름</label>
            <input
                type="text"
                id="friendName"
                placeholder="예: 나긍정"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
            />
        </div>
        <div className="input-group">
            <label htmlFor="friendMessage">응원 메시지</label>
            <textarea
                id="friendMessage"
                placeholder="예: 길동아, 너의 새로운 강점을 응원해!"
                value={friendMessage}
                onChange={(e) => setFriendMessage(e.target.value)}
            />
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="button-group">
            <button className="btn btn-secondary" onClick={onBack}>이전</button>
            <button className="btn" onClick={onNext} disabled={!friendName.trim() || !friendMessage.trim()}>
                카드 완성하기
            </button>
        </div>
    </div>
);

const FinalCardPage = ({
  studentId,
  name,
  template,
  affirmations,
  friendName,
  friendMessage,
  growthTips,
  onRestart,
  onBack,
}) => {
    const cardRef = useRef(null);

    const downloadCard = () => {
        if (cardRef.current) {
            html2canvas(cardRef.current, { 
                useCORS: true,
                backgroundColor: null, // Ensure transparent background is handled
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `${name}_긍정카드.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
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
                    color: template.font
                }}
            >