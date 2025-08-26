
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
            strengthSummary={strengthSummary}
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

    setLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, filledShortcomings }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Use the error message from the server's JSON response if available
        throw new Error(data.error || `서버에서 오류가 발생했습니다 (Status: ${response.status})`);
      }
      
      if (!data.results || data.results.length === 0) {
        throw new Error("결과가 비어있습니다. 다시 시도해주세요.");
      }
      
      setAffirmations(data.results.map(r => r.affirmation));
      setExplanations(data.results.map(r => r.explanation));
      setGrowthTips(data.results.map(r => r.growth_tip));
      setStrengthSummary(data.strength_summary);
      onNext();

    } catch (e) {
      console.error("Error generating affirmations:", e);
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
            />
            {shortcomings.length > 1 && (
              <button className="btn-remove" onClick={() => removeShortcoming(index)}>
                &times;
              </button>
            )}
          </div>
        ))}
      </div>

      {shortcomings.length < 3 && (
        <button className="btn btn-secondary" onClick={addShortcoming}>
          단점 추가하기
        </button>
      )}

      {error && <p className="error-message">{error}</p>}
      
      <div className="button-group">
          <button className="btn btn-secondary" onClick={onBack}>이전</button>
          <button className="btn" onClick={handleGenerate} disabled={loading || shortcomings.every(s => s.trim() === '')}>
              {loading ? '에너지 생성중...' : '강점 분석하기'}
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
      <h2>🔬 {name}님의 강점 분석 결과</h2>
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
  strengthSummary,
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
                <div className="card-header">
                    <h3 className="card-title">✨ {name}의 긍정 에너지 카드 ✨</h3>
                    <p className="card-user-info">{studentId} {name}</p>
                </div>

                <div className="card-content">
                    <div className="highlight-box" style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
                        <h4>🌟 {name}님은 이런 사람이에요!</h4>
                        <p className="strength-summary">{strengthSummary}</p>
                    </div>

                    <div className="highlight-box" style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
                        <h4>💌 {friendName}의 응원 메시지</h4>
                        <p className="card-quote">"{friendMessage}"</p>
                    </div>

                    <div className="highlight-box" style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}>
                        <h4>🚀 {name}님을 위한 성장 미션!</h4>
                        <ul className="mission-list">
                            {growthTips.map((tip, index) => (
                                <li key={index} className="mission-item">
                                    <input type="checkbox" id={`mission-${index}`} />
                                    <label htmlFor={`mission-${index}`}>{tip}</label>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="button-group">
                <button className="btn btn-secondary" onClick={downloadCard}>카드 저장하기</button>
                <button className="btn" onClick={onRestart}>다시 만들기</button>
            </div>
             <button className="btn btn-secondary" onClick={onBack} style={{marginTop: '10px'}}>이전</button>
        </div>
    );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);