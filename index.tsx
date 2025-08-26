import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
// FIX: Import html2canvas to resolve 'Cannot find name' error.
import html2canvas from "html2canvas";

const App = () => {
  const [page, setPage] = useState(1);
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [shortcomings, setShortcomings] = useState([""]);
  const [affirmations, setAffirmations] = useState<string[]>([]);
  const [explanations, setExplanations] = useState<string[]>([]);
  const [growthTips, setGrowthTips] = useState<string[]>([]);
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
            shortcomings={shortcomings}
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
        <h1 className="app-title">✨ 긍정 에너지 발전소 ✨</h1>
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
        <h2>⚡ 오늘의 긍정 에너지 채우기</h2>
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
  setLoading,
  setError,
  onNext,
  loading,
  error,
  onBack,
}) => {
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

  const handleSubmit = async () => {
    setError("");
    const filledShortcomings = shortcomings.filter(s => s.trim() !== "");
    if (filledShortcomings.length === 0) {
      setError("단점을 하나 이상 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `${name} 학생의 단점은 다음과 같아: ${filledShortcomings.join(", ")}. 
      이 단점들을 긍정적인 관점으로 재해석하고, 각각에 대한 따뜻하고 지지적인 설명을 덧붙여줘. 
      각 단점에 대해 다음과 같은 형식으로 답변해줘.

      1. 긍정적 재해석 (Affirmation): 단점을 강점으로 바꾸는 짧고 긍정적인 문장.
      2. 설명 (Explanation): 왜 그렇게 재해석할 수 있는지, 그 안에 어떤 잠재력이 숨어있는지에 대한 다정하고 희망적인 설명. 아이에게 말하듯이 친근한 말투로 해줘. "~구나", "~인걸", "~거야" 같은 다양한 어미를 사용해서 자연스럽게 해주고, "~란다", "~단다" 같은 어미는 반복하지 말아줘.
      3. 성장을 위한 조언 (Growth Tip): 이 강점을 더 발전시키기 위한 구체적이고 실천 가능한 조언 한 가지.
      
      결과는 JSON 형식으로 줘.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
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
            required: ["results"],
          },
        },
      });

      const jsonResponse = JSON.parse(response.text);

      // Validate the response from the AI to prevent crashing on the next page
      if (
        !jsonResponse.results ||
        !Array.isArray(jsonResponse.results) ||
        jsonResponse.results.length === 0 ||
        jsonResponse.results.length !== filledShortcomings.length
      ) {
        throw new Error("AI 응답이 비어있거나 형식이 올바르지 않습니다.");
      }
      
      const affirmations = jsonResponse.results.map(r => r.affirmation);
      const explanations = jsonResponse.results.map(r => r.explanation);
      const growthTips = jsonResponse.results.map(r => r.growth_tip);

      // Ensure that there are no undefined/null values which would break the next page
      if (affirmations.some(item => !item) || explanations.some(item => !item) || growthTips.some(item => !item)) {
          throw new Error("AI 응답에 누락된 필드가 있습니다.");
      }

      setAffirmations(affirmations);
      setExplanations(explanations);
      setGrowthTips(growthTips);
      onNext();

    } catch (e) {
      console.error(e);
      setError("긍정 에너지 생성에 실패했어요. 입력한 단어를 바꾸거나 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>🤔 나의 어떤 점을 바꿔볼까?</h2>
      <p>{name}님, 스스로 생각하는 단점이나 바꾸고 싶은 점을 적어보세요. 솔직하게 적을수록 더 큰 긍정 에너지를 얻을 수 있어요!</p>
       <div className="tips">
            <h3>💡 작성 Tip</h3>
            <ul>
                <li>예시: "나는 너무 소심해", "발표하는 게 무서워", "정리정돈을 잘 못해"</li>
                <li>최대 3개까지 작성할 수 있어요.</li>
            </ul>
        </div>
      {shortcomings.map((shortcoming, index) => (
        <div key={index} className="shortcoming-item">
          <input
            type="text"
            placeholder={`단점 ${index + 1}`}
            value={shortcoming}
            onChange={(e) => handleShortcomingChange(index, e.target.value)}
          />
          {shortcomings.length > 1 && (
            <button onClick={() => removeShortcoming(index)} className="btn-remove" aria-label={`단점 ${index + 1} 삭제`}>&times;</button>
          )}
        </div>
      ))}
       {shortcomings.length < 3 && (
        <button onClick={addShortcoming} className="btn btn-secondary">단점 추가하기</button>
      )}
      {error && <p className="error-message">{error}</p>}
      <div className="button-group">
        <button className="btn btn-secondary" onClick={onBack} disabled={loading}>이전</button>
        <button className="btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "긍정 에너지 생성 중..." : "긍정 에너지로 변환하기"}
        </button>
      </div>
    </div>
  );
};

const ExplanationPage = ({ name, explanations, shortcomings, currentExplanationIndex, setCurrentExplanationIndex, onNext, onBack }) => {
    const handleNextExplanation = () => {
        if (currentExplanationIndex < explanations.length - 1) {
            setCurrentExplanationIndex(currentExplanationIndex + 1);
        } else {
            onNext();
        }
    };

    const handlePrevExplanation = () => {
        if (currentExplanationIndex > 0) {
            setCurrentExplanationIndex(currentExplanationIndex - 1);
        } else {
            onBack();
        }
    };

    return (
        <div className="page">
            <h2>✨ 새롭게 발견한 나의 강점</h2>
            <p>"{shortcomings[currentExplanationIndex]}"라고 생각했던 점은 사실...</p>
            <div className="explanation-box">
                <p>{name}님 안에는 이런 멋진 힘이 숨어있었군요!</p>
                <blockquote>{explanations[currentExplanationIndex]}</blockquote>
            </div>
            <p>{currentExplanationIndex + 1} / {explanations.length}</p>
            <div className="button-group">
                 <button className="btn btn-secondary" onClick={handlePrevExplanation}>
                    {currentExplanationIndex === 0 ? "이전" : "이전 설명"}
                </button>
                <button className="btn" onClick={handleNextExplanation}>
                    {currentExplanationIndex === explanations.length - 1 ? "다음" : "다음 설명"}
                </button>
            </div>
        </div>
    );
};

const FriendMessagePage = ({ name, friendName, setFriendName, friendMessage, setFriendMessage, onNext, onBack, error }) => {
    return (
        <div className="page">
            <h2>💌 친구의 응원 메시지</h2>
            <p>{name}님의 긍정 에너지를 응원하는 친구의 메시지를 추가해봐요! 내가 나에게 보내는 응원도 좋아요.</p>
            <div className="input-group">
                <label htmlFor="friendName">친구 이름</label>
                <input
                    type="text"
                    id="friendName"
                    placeholder="예: 베프"
                    value={friendName}
                    onChange={(e) => setFriendName(e.target.value)}
                />
            </div>
            <div className="input-group">
                <label htmlFor="friendMessage">응원 메시지</label>
                <textarea
                    id="friendMessage"
                    placeholder="예: 너는 정말 멋진 친구야! 항상 응원할게."
                    value={friendMessage}
                    onChange={(e) => setFriendMessage(e.target.value)}
                    rows={4}
                />
            </div>
            {error && <p className="error-message">{error}</p>}
            <div className="button-group">
                <button className="btn btn-secondary" onClick={onBack}>이전</button>
                <button className="btn" onClick={onNext}>다음</button>
            </div>
        </div>
    );
};

const FinalCardPage = ({ studentId, name, template, affirmations, friendName, friendMessage, shortcomings, growthTips, onRestart, onBack }) => {
    const cardRef = useRef(null);

    const downloadCard = async () => {
        if (!cardRef.current) return;
        
        const cardElement = cardRef.current;
        const originalStyle = {
            maxHeight: cardElement.style.maxHeight,
            overflowY: cardElement.style.overflowY
        };

        // Temporarily change styles to capture full content
        cardElement.style.maxHeight = 'none';
        cardElement.style.overflowY = 'visible';
        
        try {
            const canvas = await html2canvas(cardElement, {
                useCORS: true,
                scale: 2,
                backgroundColor: null,
            });
            const image = canvas.toDataURL("image/png", 1.0);
            const link = document.createElement("a");
            link.href = image;
            link.download = `${studentId}-${name}-긍정카드.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Oops, something went wrong!", error);
        } finally {
            // Restore original styles
            cardElement.style.maxHeight = originalStyle.maxHeight;
            cardElement.style.overflowY = originalStyle.overflowY;
        }
    };

    return (
        <div className="page">
             <div ref={cardRef} className="card-container" style={{ backgroundColor: template.bg, color: template.font }}>
                <div className="card-header">
                    <h3 className="final-title">✨ {name}님을 위한 긍정 에너지 카드 ✨</h3>
                    <p className="card-user-info">{studentId} {name}</p>
                </div>
                <div className="card-content">
                    <div className="highlight-box" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
                        <h4>새롭게 발견한 나의 강점</h4>
                        <ul>
                            {affirmations.map((aff, index) => (
                                <li key={index}><strong>{shortcomings[index]}</strong> → {aff}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="highlight-box" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
                         <h4>💌 {friendName}님의 응원 메시지</h4>
                         <p>"{friendMessage}"</p>
                    </div>

                    <div className="highlight-box" style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}>
                        <h4>🌱 성장을 위한 미션!</h4>
                        <div className="mission-list">
                            {growthTips.map((tip, index) => (
                                <div key={index} className="mission-item">
                                    <input type="checkbox" id={`mission-${index}`} />
                                    <label htmlFor={`mission-${index}`}>{tip}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="card-footer">
                    <p>이 카드를 보며 매일 긍정 에너지를 충전해요!</p>
                </div>
            </div>
            <div className="button-group">
                <button className="btn btn-secondary" onClick={onBack}>이전</button>
                <button className="btn" onClick={downloadCard}>이미지로 저장하기</button>
            </div>
            <button className="btn" onClick={onRestart} style={{marginTop: '10px'}}>처음으로 돌아가기</button>
        </div>
    );
};


const root = createRoot(document.getElementById("root"));
root.render(<App />);