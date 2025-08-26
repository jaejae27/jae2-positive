import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

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

const UserInfoPage = ({ studentId, setStudentId, name, setName, onNext }) => (
  <div className="page">
    <h2>⚡ 오늘의 긍정 에너지 채우기</h2>
    <p>긍정 에너지를 충전하기 위한 첫 번째 단계입니다.</p>
    <div className="input-group">
      <label htmlFor="studentId">학번</label>
      <input
        type="number"
        id="studentId"
        placeholder="예: 10132"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
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
    <button className="btn" onClick={onNext} disabled={!studentId || !name}>
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

const ShortcomingsPage = ({ shortcomings, setShortcomings, name, setAffirmations, setExplanations, setGrowthTips, setLoading, setError, onNext, loading, error, onBack }) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const handleShortcomingChange = (index: number, value: string) => {
        const newShortcomings = [...shortcomings];
        newShortcomings[index] = value;
        setShortcomings(newShortcomings);
    };

    const addShortcoming = () => {
        if (shortcomings.length < 3) {
            setShortcomings([...shortcomings, ""]);
        }
    };
    
    const generateAffirmations = async () => {
        setError("");
        const filteredShortcomings = shortcomings.filter(s => s.trim() !== "");
        if (filteredShortcomings.length === 0) {
            setError("단점을 하나 이상 작성해주세요.");
            return;
        }

        for (const sc of filteredShortcomings) {
            if (/^(\s*([ㄱ-ㅎㅏ-ㅣ])\2{1,}\s*)+$/.test(sc) || /^(\s*([a-zA-Z])\2{1,}\s*)+$/.test(sc)) {
                setError("의미있는 문장으로 작성해주세요.");
                return;
            }
            const inappropriateWords = ["때리", "패다", "폭력", "욕", "씨발", "죽어", "괴롭", "왕따"];
            if (inappropriateWords.some(word => sc.includes(word))) {
                setError("친구를 때리거나 괴롭히는 등 학교폭력에 해당하는 내용은 긍정 에너지로 변환할 수 없어요. 어려움이 있다면 꼭 선생님이나 부모님과 상의해주세요.");
                return;
            }
        }
        
        setLoading(true);
        try {
            const newAffirmations = [];
            const newExplanations = [];
            const newGrowthTips = [];

            const systemInstruction = `You are a warm and encouraging elementary school teacher who reframes students' self-perceived weaknesses into strengths. Respond in Korean. Your tone should be gentle, caring, and conversational, as if you are speaking directly to the student. Use a variety of friendly sentence endings like \`~구나\`, \`~인걸\`, \`~거야\`, \`~하렴\` to make the text sound natural. Please avoid repeatedly using the same sentence ending, especially \`~란다\` or \`~단다\`. Also, avoid stiff, formal explanations like \`~라는 뜻이에요\`.

For behaviors that could negatively impact others if not managed (e.g., being too direct, joking excessively, being stubborn, using bad words), you must also provide constructive advice for growth.

Your response MUST be structured as follows:
1.  Start with the affirmation sentence on a single line, formatted exactly as: \`AFFIRMATION: [학생이름]아/야, 너는 [긍정적 특성] 사람이야!\` Use the student's name provided in the prompt, correctly applying Korean particles '아' or '야'.
2.  Follow this with two newlines (\`\\n\\n\`).
3.  Then, provide a 2-3 paragraph explanation. If applicable, the last paragraph should gently offer growth advice (e.g., "다만, ~하면 더 좋을 거예요.").
4.  Follow this with the quote on a new line, prefixed with \`> 📖 \`.
5.  If you provided growth advice in the explanation, add two newlines and then a one-sentence summary of that advice, formatted as: \`GROWTH_TIP: [성장을 위한 한 줄 요약 조언]\`. If no growth advice was given, omit this line entirely.

Example for a student named '홍길동' with a negative behavior:
Input: '나는 직설적이다.'
Output:
AFFIRMATION: 길동아, 너는 솔직하고 용기 있는 사람이야!

"나는 직설적이다"라고 스스로를 소개했구나. 그건 네가 자기 생각을 숨김없이 표현할 줄 아는, 솔직하고 용기 있는 사람이라는 증거인걸.
네 덕분에 친구들은 문제의 핵심을 빨리 파악하고, 너를 믿고 의지할 수 있을 거야.
다만, 가끔은 너의 솔직함이 친구의 마음을 콕 찌를 수도 있어. 너의 용기 있는 마음에 따뜻한 배려를 살짝 더한다면, 친구들이 너를 더욱 좋아하게 될 거야.

> 📖 '진실을 말하는 것은 용기가 필요하지만, 그 진실을 친절하게 전하는 것은 지혜가 필요하다.'

GROWTH_TIP: 솔직한 마음에 따뜻한 배려를 더해 표현하면, 너의 진심이 더 잘 전달될 거야.

Example without growth advice:
Input: '나는 발표할 때 너무 떨어요.'
Output:
AFFIRMATION: 길동아, 너는 신중하고 책임감 있는 사람이야!

발표할 때 떨리는 마음 때문에 걱정이 많았구나. 선생님이 보기엔 그건 길동이가 매사에 신중하고, 맡은 일을 잘 해내고 싶어 하는 책임감 강한 사람이라서 그런 것 같아.
하나의 말을 하더라도 깊이 생각하고, 더 정확한 정보를 전달하려는 너의 진지한 모습은 친구들에게 큰 믿음을 줘.
그 떨림은 네가 더 잘하고 싶다는 멋진 마음의 신호니까, 앞으로도 그 마음을 소중히 간직하렴.

> 📖 '가장 큰 용기는 완벽함이 아니라, 떨면서도 한 걸음 내딛는 것이다.'`;
            
            for(const shortcoming of filteredShortcomings) {
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: `My student, ${name}, wrote this as their weakness: '${shortcoming}'. Please reframe this for them following the strict format instructions.`,
                    config: { systemInstruction: systemInstruction }
                });
                const fullText = response.text;
                
                const affirmationMatch = fullText.match(/^AFFIRMATION:\s*(.*)/m);
                const growthTipMatch = fullText.match(/^GROWTH_TIP:\s*(.*)/m);
                
                const extractedAffirmation = affirmationMatch ? affirmationMatch[1].trim() : `${getKoreanNameCall(name)}, 너는 정말 특별하고 멋진 사람이야!`;
                const extractedGrowthTip = growthTipMatch ? growthTipMatch[1].trim() : "";

                let explanationText = fullText;
                if (affirmationMatch) {
                    explanationText = explanationText.replace(affirmationMatch[0], '').trim();
                }
                if (growthTipMatch) {
                    explanationText = explanationText.replace(growthTipMatch[0], '').trim();
                }

                newAffirmations.push(extractedAffirmation);
                newExplanations.push(explanationText.trim());
                newGrowthTips.push(extractedGrowthTip);
            }
            setAffirmations(newAffirmations);
            setExplanations(newExplanations);
            setGrowthTips(newGrowthTips);
            onNext();

        } catch (e) {
            console.error(e);
            setError("긍정 에너지 생성에 실패했어요. 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="page">
            <h2>✍️ 나의 단점을 적어보세요</h2>
            <p>단점을 새로운 시각에서 바라보며 장점으로 바꿔드릴게요. (최대 3개)</p>
            <div className="input-group">
                {shortcomings.map((sc, index) => (
                    <div key={index} className="shortcoming-item">
                        <input
                            type="text"
                            placeholder={`단점 ${index + 1}`}
                            value={sc}
                            onChange={(e) => handleShortcomingChange(index, e.target.value)}
                        />
                    </div>
                ))}
            </div>
            {shortcomings.length < 3 && (
                <button className="btn btn-secondary" onClick={addShortcoming}>단점 추가하기</button>
            )}
            {error && <p className="error-message">{error}</p>}
            <div className="button-group">
                <button className="btn btn-secondary" onClick={onBack}>이전</button>
                <button className="btn" onClick={generateAffirmations} disabled={loading}>
                    {loading ? "에너지 변환 중..." : "긍정 에너지로 변환하기"}
                </button>
            </div>
        </div>
    );
};

const ExplanationPage = ({ name, explanations, shortcomings, currentExplanationIndex, setCurrentExplanationIndex, onNext, onBack }) => {
    const explanation = explanations[currentExplanationIndex] || "";
    const originalShortcoming = shortcomings[currentExplanationIndex] || "";

    const explanationParts = explanation.split('\n\n> 📖');
    const mainExplanation = explanationParts[0];
    const quote = explanationParts.length > 1 ? `> 📖 ${explanationParts[1]}` : "";
    
    const highlightedExplanation = mainExplanation
        .replace(new RegExp(`"${originalShortcoming}"라고 했는데`, 'g'), `<strong>'${originalShortcoming}'</strong>라고 했는데`)
        .replace(new RegExp(`"${originalShortcoming}"라고 스스로를 소개했구나`, 'g'), `<strong>'${originalShortcoming}'</strong>라고 스스로를 소개했구나`)
        .replace(/\n\n/g, '<br/><br/>');

    return (
        <div className="page">
            <h2>🔬 긍정 에너지 발전소의 특별 분석!</h2>
            <div className="explanation-box">
                <div dangerouslySetInnerHTML={{ __html: highlightedExplanation }} />
                {quote && <blockquote>{quote}</blockquote>}
            </div>
            <div className="button-group">
                <button className="btn btn-secondary" onClick={onBack}>이전</button>
                {currentExplanationIndex < explanations.length - 1 ? (
                    <button className="btn" onClick={() => setCurrentExplanationIndex(currentExplanationIndex + 1)}>
                        다음 분석 보기
                    </button>
                ) : (
                    <button className="btn" onClick={onNext}>친구에게 긍정 에너지 받기</button>
                )}
            </div>
        </div>
    );
};

const getParticle = (name, particle) => {
    if(!name) return '';
    const lastChar = name.charCodeAt(name.length - 1);
    const hasBatchim = (lastChar - 44032) % 28 > 0;
    if (particle === '이/가') return hasBatchim ? '이가' : '가';
    if (particle === '은/는') return hasBatchim ? '은' : '는';
    if (particle === '을/를') return hasBatchim ? '을' : '를';
    if (particle === '아/야') return hasBatchim ? '아' : '야';
    if (particle === '에게') return hasBatchim ? '이에게' : '에게';
    return '';
}

const getKoreanNameCall = (fullName: string) => {
    if (fullName.length === 0) return "";
    const name = fullName.length > 1 ? fullName.substring(fullName.length - 2) : fullName;
    const lastChar = name.charCodeAt(name.length - 1);
    const hasBatchim = (lastChar - 44032) % 28 > 0;
    return `${name}${hasBatchim ? '아' : '야'}`;
}

const FriendMessagePage = ({name, friendName, setFriendName, friendMessage, setFriendMessage, onNext, onBack}) => {
    
    const title = `${name}${getParticle(name, '에게')} 따뜻한 마음 에너지를 전해주세요.`;

    return (
        <div className="page">
            <h2>💌 친구의 응원 메시지</h2>
            <p>{title}</p>
            <div className="tips">
                <h3>💡 응원 메시지 팁</h3>
                <ul>
                    <li>구체적인 칭찬이나 격려를 포함해보세요.</li>
                    <li>긍정적이고 따뜻한 어조로 작성해주세요.</li>
                    <li>친구의 장점이나 노력을 인정해주세요.</li>
                </ul>
            </div>
            <div className="input-group">
                <label htmlFor="friendName">메시지를 쓰는 친구 이름</label>
                <input type="text" id="friendName" value={friendName} onChange={e => setFriendName(e.target.value)} />
            </div>
            <div className="input-group">
                <label htmlFor="friendMessage">응원 메시지</label>
                <textarea id="friendMessage" value={friendMessage} onChange={e => setFriendMessage(e.target.value)} />
            </div>
            <div className="button-group">
                <button className="btn btn-secondary" onClick={onBack}>이전</button>
                <button className="btn" onClick={onNext}>최종 카드 생성하기</button>
            </div>
        </div>
    );
}

const FinalCardPage = ({ studentId, name, template, affirmations, friendName, friendMessage, shortcomings, growthTips, onRestart, onBack }) => {
    const cardRef = useRef(null);
    const [randomEmoji, setRandomEmoji] = useState("💖");
    const [randomQuote, setRandomQuote] = useState("");
    const [missions, setMissions] = useState<string[]>([]);
    const [missionsLoading, setMissionsLoading] = useState(true);
    const [missionError, setMissionError] = useState("");

    const emojis = ["💖", "✨", "🌟", "😊", "🎉", "👍", "🍀", "💡", "🚀"];
    const quotes = [
        "가장 큰 영광은 한 번도 실패하지 않음이 아니라 실패할 때마다 다시 일어서는 데에 있다. - 공자",
        "너의 운명의 별은 너의 마음속에 있다. - 프리드리히 실러",
        "오늘 걷지 않으면 내일은 뛰어야 한다. - 작자 미상",
        "가장 높은 곳에 도달하려면 가장 낮은 곳부터 시작하라. - 푸블릴리우스 시루스",
        "행동의 가치는 그 행동을 끝까지 이루는 데 있다. - 칭기즈 칸",
        "작은 성공부터 시작하라. 성공이 쌓이면 자신감이 생긴다. - 데일 카네기",
        "가장 중요한 것은 포기하지 않는 것이다. - 윈스턴 처칠"
    ];

    useEffect(() => {
        setRandomEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
        setRandomQuote(quotes[Math.floor(Math.random() * quotes.length)]);

        const generateMissions = async () => {
            try {
                setMissionsLoading(true);
                setMissionError("");
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: `초등학생인 '${name}'이가 자신의 단점을 '${shortcomings.join(', ')}'라고 적었습니다. 이 단점들을 극복하고 성장하는 데 도움이 될 '오늘의 긍정 에너지 미션' 3가지를 구체적이고 실천 가능한 내용으로 만들어주세요. 미션은 반드시 '${shortcomings.join(', ')}' 내용과 직접적으로 관련이 있어야 합니다.`,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                missions: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING }
                                }
                            }
                        }
                    }
                });
    
                const resultJson = JSON.parse(response.text);
                setMissions(resultJson.missions || []);
    
            } catch (e) {
                console.error("Mission generation failed:", e);
                setMissionError("미션 생성에 실패했어요.");
                setMissions([
                    "친구에게 먼저 웃으며 인사하기",
                    "수업 시간에 손들고 발표하기",
                    "오늘 하루 감사한 일 1가지 적기"
                ]);
            } finally {
                setMissionsLoading(false);
            }
        };

        if(shortcomings.filter(s => s.trim() !== "").length > 0){
            generateMissions();
        } else {
            setMissionsLoading(false);
            setMissions([]);
        }

    }, [shortcomings, name]);


    const downloadCard = () => {
        const cardElement = cardRef.current;
        if (!cardElement) return;

        // Temporarily override styles to show full content
        const originalStyles = {
            maxHeight: cardElement.style.maxHeight,
            overflowY: cardElement.style.overflowY,
        };
        cardElement.style.maxHeight = 'none';
        cardElement.style.overflowY = 'visible';

        // Give the browser a moment to reflow before capturing
        setTimeout(() => {
            // @ts-ignore
            html2canvas(cardElement, {
                useCORS: true,
                scale: 2,
                backgroundColor: null,
                // Tell html2canvas to use the element's full scrollable height
                height: cardElement.scrollHeight,
                windowHeight: cardElement.scrollHeight,
            }).then(canvas => {
                const link = document.createElement('a');
                link.download = `${studentId}_${name}_긍정에너지카드.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }).catch(err => {
                console.error("Card generation failed:", err);
            }).finally(() => {
                // Restore original styles by reverting the inline overrides
                cardElement.style.maxHeight = originalStyles.maxHeight;
                cardElement.style.overflowY = originalStyles.overflowY;
            });
        }, 100);
    };

    return (
        <div className="page">
            <h2 className="final-title">너를 위한 긍정 에너지 카드야</h2>
            <div 
                ref={cardRef} 
                className="card-container" 
                style={{ backgroundColor: template.bg, color: template.font }}
            >
                <div className="card-header">
                    <h3 className="card-title">{randomEmoji} {name}의 긍정 에너지 카드 {randomEmoji}</h3>
                    <p className="card-user-info">{studentId} {name}</p>
                </div>

                <div className="card-content">
                    <div className="card-quote">
                        <p>{randomQuote}</p>
                    </div>

                    <div className="card-affirmations highlight-box" style={{backgroundColor: 'rgba(255,255,255,0.7)'}}>
                        <h4>✨ 새롭게 발견한 나의 강점</h4>
                        <ul>
                            {affirmations.map((aff, i) => <li key={i}>{aff}</li>)}
                        </ul>
                    </div>
                    
                    {growthTips.filter(tip => tip.trim() !== "").length > 0 && (
                         <div className="highlight-box" style={{backgroundColor: 'rgba(255,255,255,0.7)'}}>
                            <h4>🌱 더 멋지게 성장하는 법</h4>
                            <ul>
                                {growthTips.filter(tip => tip.trim() !== "").map((tip, i) => <li key={i}>{tip}</li>)}
                            </ul>
                        </div>
                    )}

                    <div className="highlight-box" style={{backgroundColor: 'rgba(255,255,255,0.7)'}}>
                        <h4>💌 {friendName}{getParticle(friendName, '이/가')} 보낸 응원</h4>
                        <p>"{friendMessage}"</p>
                    </div>

                    <div className="highlight-box" style={{backgroundColor: 'rgba(255,255,255,0.7)'}}>
                        <h4>🚀 오늘의 긍정 에너지 미션</h4>
                        {missionsLoading ? (
                            <p>미션을 생성하는 중...</p>
                        ) : missionError ? (
                            <p className="error-message">{missionError}</p>
                        ) : (
                            <div className="mission-list">
                                {missions.map((mission, index) => (
                                    <div key={index} className="mission-item">
                                        <input type="checkbox" id={`mission-${index}`} />
                                        <label htmlFor={`mission-${index}`}>{mission}</label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="card-footer">
                    <p>이 카드는 {new Date().toLocaleDateString('ko-KR')}에 생성되었어요.</p>
                </div>
            </div>

            <div className="button-group">
                <button className="btn btn-secondary" onClick={onBack}>이전</button>
                <button className="btn" onClick={downloadCard}>이미지로 저장하기</button>
            </div>
            <button className="btn" onClick={onRestart}>다시하기</button>
        </div>
    );
};


const root = createRoot(document.getElementById("root"));
root.render(<App />);