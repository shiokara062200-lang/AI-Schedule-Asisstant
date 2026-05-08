import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';

// --- Icons ---
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

const STORAGE_KEYS = {
  WORDS: 'sr_flashcards_words',
  SETTINGS: 'sr_flashcards_settings'
};

const generateId = () => Math.random().toString(36).substring(2, 9);

const INITIAL_WORDS = [
  { id: generateId(), en: 'apple', ja: 'りんご', interval: 0, repetitions: 0, easeFactor: 2.5, nextReviewDate: Date.now() },
  { id: generateId(), en: 'computer', ja: 'コンピューター', interval: 0, repetitions: 0, easeFactor: 2.5, nextReviewDate: Date.now() },
  { id: generateId(), en: 'develop', ja: '開発する', interval: 0, repetitions: 0, easeFactor: 2.5, nextReviewDate: Date.now() },
  { id: generateId(), en: 'environment', ja: '環境', interval: 0, repetitions: 0, easeFactor: 2.5, nextReviewDate: Date.now() },
];

const DEFAULT_SETTINGS = {
  intervals: [1, 6],
  reviewTime: '08:00',
};

const calculateNextReview = (word, isCorrect, settings) => {
  let { repetitions, interval, easeFactor } = word;
  if (isCorrect) {
    if (repetitions < settings.intervals.length) {
      interval = settings.intervals[repetitions];
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 0;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  }
  const now = new Date();
  if (interval === 0) {
    return { ...word, repetitions, interval, easeFactor, nextReviewDate: now.getTime() };
  } else {
    const nextDate = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);
    if (settings.reviewTime) {
      const [hours, minutes] = settings.reviewTime.split(':').map(Number);
      nextDate.setHours(hours, minutes, 0, 0);
    }
    return { ...word, repetitions, interval, easeFactor, nextReviewDate: nextDate.getTime() };
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('learn');
  const [words, setWords] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WORDS);
    return saved ? JSON.parse(saved) : INITIAL_WORDS;
  });
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(words));
  }, [words]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const dueWords = useMemo(() => {
    const now = Date.now();
    return words.filter(w => w.nextReviewDate <= now);
  }, [words]);

  const handleUpdateWordProgress = useCallback((wordId, isCorrect) => {
    setWords(prevWords => 
      prevWords.map(w => 
        w.id === wordId ? calculateNextReview(w, isCorrect, settings) : w
      )
    );
  }, [settings]);

  const handleDeleteWord = (wordId) => {
    setWords(prev => prev.filter(w => w.id !== wordId));
  };

  const forceAllDue = () => {
    setWords(prev => prev.map(w => ({ ...w, nextReviewDate: Date.now() })));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <ClockIcon /> Spaced Repetition
          </h1>
          <nav className="flex space-x-1">
            <TabButton active={activeTab === 'learn'} onClick={() => setActiveTab('learn')} icon={<PlayIcon />} label="学習" />
            <TabButton active={activeTab === 'words'} onClick={() => setActiveTab('words')} icon={<ListIcon />} label="単語" />
            <TabButton active={activeTab === 'data'} onClick={() => setActiveTab('data')} icon={<FileTextIcon />} label="データ" />
            <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon />} label="設定" />
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 py-8">
        {activeTab === 'learn' && (
          <LearnTab 
            dueWords={dueWords} 
            onUpdateProgress={handleUpdateWordProgress} 
            onForceDue={forceAllDue}
          />
        )}
        {activeTab === 'words' && <WordsTab words={words} onDeleteWord={handleDeleteWord} />}
        {activeTab === 'data' && <DataTab setWords={setWords} words={words} />}
        {activeTab === 'settings' && <SettingsTab settings={settings} setSettings={setSettings} />}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {icon} <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function LearnTab({ dueWords, onUpdateProgress, onForceDue }) {
  const [sessionState, setSessionState] = useState('setup');
  const [mode, setMode] = useState('ja-to-en');
  const [inputFormat, setInputFormat] = useState('typing');
  const [sessionQueue, setSessionQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [hasMistake, setHasMistake] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isPendingPartial, setIsPendingPartial] = useState(false); // 一部一致の保留状態
  const [retryWords, setRetryWords] = useState([]);
  const [isRetrySession, setIsRetrySession] = useState(false);
  
  const inputRef = useRef(null);

  const currentWord = sessionQueue[currentIndex];
  const isEnTarget = mode === 'ja-to-en';
  const questionText = isEnTarget ? currentWord?.ja : currentWord?.en;
  const correctAnswer = isEnTarget ? currentWord?.en : currentWord?.ja;

  const startSession = (wordsToLearn, isRetry = false) => {
    const shuffled = [...wordsToLearn].sort(() => Math.random() - 0.5);
    setSessionQueue(shuffled);
    setCurrentIndex(0);
    setSessionState('learning');
    setUserInput('');
    setIsAnswered(false);
    setHasMistake(false);
    setIsRevealed(false);
    setIsPendingPartial(false);
    setRetryWords([]);
    setIsRetrySession(isRetry);
  };

  const handleNext = useCallback(() => {
    setUserInput('');
    setIsAnswered(false);
    setHasMistake(false);
    setIsRevealed(false);
    setIsPendingPartial(false);
    if (currentIndex + 1 >= sessionQueue.length) setSessionState('finished');
    else setCurrentIndex(prev => prev + 1);
  }, [currentIndex, sessionQueue.length]);

  const recordResult = useCallback((isCorrect) => {
    if (!hasMistake && !isRetrySession) {
      onUpdateProgress(currentWord.id, isCorrect);
    }
    if (isCorrect) {
      setIsAnswered(true);
      setIsPendingPartial(false);
    } else {
      setHasMistake(true);
      setIsPendingPartial(false);
      setRetryWords(prev => prev.find(w => w.id === currentWord.id) ? prev : [...prev, currentWord]);
      setUserInput('');
    }
  }, [currentWord, hasMistake, isRetrySession, onUpdateProgress]);

  const handleAnswerAttempt = useCallback(() => {
    if (inputFormat === 'flashcard' && !hasMistake && !isAnswered) {
        if (!isRevealed) setIsRevealed(true);
        return;
    }
    
    if (!userInput.trim()) return;

    const input = userInput.trim().toLowerCase();
    const correct = correctAnswer?.trim().toLowerCase();
    
    // 完全一致
    if (input === correct) {
      recordResult(true);
      return;
    }

    // 日本語ターゲット（英語→日本語）の場合のみ、一部一致の判定を行う
    if (!isEnTarget) {
      const partial = (correct?.includes(input) || input.includes(correct));
      if (partial) {
        setIsPendingPartial(true);
        return;
      }
    }

    // それ以外は不正解
    recordResult(false);
  }, [userInput, correctAnswer, recordResult, inputFormat, isRevealed, isAnswered, hasMistake, isEnTarget]);

  // Global Key Down Listener
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if (sessionState !== 'learning') return;
      if (e.key === 'Enter') {
        if (isAnswered) {
          handleNext();
        } else if (hasMistake) {
          handleAnswerAttempt();
        } else if (isPendingPartial) {
          // 一部一致が出ている状態でEnterを押した場合は、通常の不正解として進める
          recordResult(false);
        } else {
          handleAnswerAttempt();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [sessionState, isAnswered, hasMistake, isPendingPartial, recordResult, handleNext, handleAnswerAttempt]);

  useEffect(() => {
    if (sessionState === 'learning' && !isAnswered && !isPendingPartial && (inputFormat === 'typing' || hasMistake) && inputRef.current) {
      inputRef.current.focus();
    }
  }, [sessionState, currentIndex, isAnswered, hasMistake, inputFormat, isPendingPartial]);

  const handleFlashcardReview = (isCorrect) => {
    if (!hasMistake && !isRetrySession) onUpdateProgress(currentWord.id, isCorrect);
    if (!isCorrect) {
        setRetryWords(prev => prev.find(w => w.id === currentWord.id) ? prev : [...prev, currentWord]);
    }
    handleNext();
  };

  if (sessionState === 'setup') {
    return (
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border text-center">
        <h2 className="text-2xl font-bold mb-8 text-slate-800">復習セッション</h2>
        {dueWords.length > 0 ? (
          <div className="space-y-6">
            <p className="text-slate-600">現在復習が必要な単語: <span className="text-indigo-600 font-bold">{dueWords.length}</span> 個</p>
            <div className="text-left bg-slate-50 p-6 rounded-2xl space-y-4">
               <div>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">出題モード</p>
                 <div className="flex gap-4">
                   <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                     <input type="radio" checked={mode === 'ja-to-en'} onChange={() => setMode('ja-to-en')} className="accent-indigo-600 w-4 h-4" /> 日本語 → 英語
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                     <input type="radio" checked={mode === 'en-to-ja'} onChange={() => setMode('en-to-ja')} className="accent-indigo-600 w-4 h-4" /> 英語 → 日本語
                   </label>
                 </div>
               </div>
               <div className="pt-2">
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">学習形式</p>
                 <div className="flex gap-4">
                   <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                     <input type="radio" checked={inputFormat === 'typing'} onChange={() => setInputFormat('typing')} className="accent-indigo-600 w-4 h-4" /> タイピング
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                     <input type="radio" checked={inputFormat === 'flashcard'} onChange={() => setInputFormat('flashcard')} className="accent-indigo-600 w-4 h-4" /> カード
                   </label>
                 </div>
               </div>
            </div>
            <button onClick={() => startSession(dueWords)} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all text-lg">学習をはじめる</button>
          </div>
        ) : (
          <div className="py-12">
            <p className="text-emerald-600 font-black text-xl mb-4">完璧です！🎉</p>
            <p className="text-slate-400 text-sm mb-8">現在復習が必要な単語はありません。</p>
            <button onClick={onForceDue} className="text-xs text-slate-300 hover:text-indigo-400 transition-colors">デモ用に全単語をリセットして再学習する</button>
          </div>
        )}
      </div>
    );
  }

  if (sessionState === 'finished') {
    return (
      <div className="max-w-xl mx-auto bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center">
        <div className="text-5xl mb-6">🏁</div>
        <h2 className="text-2xl font-black mb-4 text-slate-800">お疲れ様でした！</h2>
        {retryWords.length > 0 ? (
          <div className="space-y-4">
            <p className="text-rose-500 font-bold mb-6">間違えた単語が {retryWords.length} 個あります。<br />定着させるために今すぐ復習しましょう。</p>
            <button onClick={() => startSession(retryWords, true)} className="w-full bg-rose-600 text-white font-black py-4 rounded-2xl hover:bg-rose-700 shadow-lg shadow-rose-100">間違えた単語をやり直す</button>
            <button onClick={() => setSessionState('setup')} className="w-full bg-slate-100 py-4 rounded-2xl font-black text-slate-500">あとでやる</button>
          </div>
        ) : (
          <button onClick={() => setSessionState('setup')} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700">トップに戻る</button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4 flex items-center justify-center gap-4">
        <div className="h-1 bg-slate-200 flex-grow rounded-full overflow-hidden max-w-[200px]">
           <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${((currentIndex) / sessionQueue.length) * 100}%` }}></div>
        </div>
        <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase">{currentIndex + 1} / {sessionQueue.length}</span>
      </div>

      <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 relative">
        <div className="text-center mb-12">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">{isEnTarget ? '日本語を見て英語で' : '英語を見て日本語で'}</p>
          <h2 className="text-5xl font-black text-slate-800 leading-tight">{questionText}</h2>
        </div>

        {inputFormat === 'flashcard' && !hasMistake && !isAnswered ? (
          <div className="space-y-6">
            {!isRevealed ? (
              <button onClick={() => setIsRevealed(true)} className="w-full py-6 bg-slate-800 text-white font-black rounded-3xl text-xl hover:bg-slate-700 transition-all transform hover:-translate-y-1">答えを表示 (Enter)</button>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="py-10 bg-indigo-50 rounded-3xl border-2 border-indigo-100 text-center text-4xl font-black text-indigo-700">{correctAnswer}</div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => handleFlashcardReview(false)} className="py-5 bg-rose-50 text-rose-600 font-black rounded-2xl hover:bg-rose-100 transition-colors">忘れた</button>
                  <button onClick={() => handleFlashcardReview(true)} className="py-5 bg-emerald-50 text-emerald-600 font-black rounded-2xl hover:bg-emerald-100 transition-colors">覚えた</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="relative">
              <input 
                  ref={inputRef}
                  type="text" 
                  value={userInput} 
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={isAnswered || isPendingPartial}
                  placeholder={isPendingPartial ? "" : "解答を入力..."}
                  className={`w-full text-center text-3xl p-6 rounded-3xl border-4 outline-none transition-all ${
                      isAnswered ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : hasMistake ? 'border-rose-300 bg-rose-50 text-rose-700' : isPendingPartial ? 'border-amber-400 bg-amber-50' : 'border-slate-50 bg-slate-50 focus:border-indigo-400'
                  }`}
              />
              
              {isPendingPartial && (
                <div className="absolute -bottom-10 left-0 right-0 animate-in zoom-in-95 duration-200">
                  <div className="bg-amber-100 border-2 border-amber-300 p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">一部一致判定</span>
                      <span className="text-sm font-bold text-amber-900">正解は 「<span className="underline decoration-2">{correctAnswer}</span>」 です。</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => recordResult(false)} className="bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md hover:bg-rose-700">不正解</button>
                      <button onClick={() => recordResult(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md hover:bg-emerald-700">正解にする</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={`${isPendingPartial ? 'mt-16' : ''} transition-all`}>
              {isAnswered ? (
                <button onClick={handleNext} className="w-full py-6 bg-emerald-600 text-white font-black rounded-3xl text-xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all">次へ進む (Enter)</button>
              ) : hasMistake ? (
                <div className="text-center space-y-6 animate-in zoom-in-95">
                  <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-3xl">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">正しいスペル/意味</p>
                    <p className="text-4xl font-black text-rose-700">{correctAnswer}</p>
                  </div>
                  <button onClick={handleAnswerAttempt} className="w-full py-5 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-700 shadow-lg">正しく入力して確認 (Enter)</button>
                </div>
              ) : !isPendingPartial ? (
                <button onClick={handleAnswerAttempt} className="w-full py-6 bg-slate-800 text-white font-black rounded-3xl text-xl hover:bg-slate-700 shadow-xl shadow-slate-200 transition-all">回答する (Enter)</button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Data Tab ---
function DataTab({ setWords, words }) {
  const [inputText, setInputText] = useState('');
  const [msg, setMsg] = useState('');

  const handleImport = () => {
    if (!inputText.trim()) return;
    const lines = inputText.split('\n');
    const newWords = lines.map(line => {
      const parts = line.split(/,|\t/);
      if (parts.length >= 2) {
        return { id: generateId(), en: parts[0].trim(), ja: parts[1].trim(), interval: 0, repetitions: 0, easeFactor: 2.5, nextReviewDate: Date.now() };
      }
      return null;
    }).filter(Boolean);
    setWords(prev => [...prev, ...newWords]);
    setMsg(`${newWords.length}語追加しました！`);
    setInputText('');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-3xl border shadow-sm">
        <h2 className="font-black text-2xl mb-6 text-slate-800 tracking-tight">単語をインポート</h2>
        <p className="text-xs text-slate-400 mb-6 font-medium leading-relaxed">
           Excelやスプレッドシートからコピー、または CSV形式（英語, 日本語）で一行ずつ入力してください。
        </p>
        <textarea 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)} 
            placeholder="apple, りんご&#10;banana, バナナ" 
            className="w-full h-56 p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl mb-6 font-mono text-sm focus:border-indigo-400 outline-none transition-colors"
        />
        <button onClick={handleImport} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">リストに追加する</button>
        {msg && <div className="mt-6 text-center text-emerald-600 font-black animate-bounce">{msg}</div>}
      </div>
      <div className="p-8 bg-rose-50 rounded-3xl border border-rose-100 flex items-center justify-between">
        <div>
          <h2 className="text-rose-800 font-black">データの初期化</h2>
          <p className="text-xs text-rose-600">全単語と学習記録が削除されます。</p>
        </div>
        <button onClick={() => window.confirm('本当に削除しますか？') && setWords([])} className="bg-rose-600 text-white px-8 py-3 rounded-xl text-xs font-black hover:bg-rose-700 shadow-md">実行</button>
      </div>
    </div>
  );
}

// --- List Tab ---
function WordsTab({ words, onDeleteWord }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <div className="p-6 border-b bg-slate-50 flex items-center justify-between">
        <h2 className="font-black text-slate-800 tracking-tight">登録単語 <span className="text-indigo-500 ml-1">{words.length}</span></h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b">
            <tr>
              <th className="px-8 py-5">英単語 / 意味</th>
              <th className="px-8 py-5">進捗</th>
              <th className="px-8 py-5">次回復習</th>
              <th className="px-8 py-5 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {words.map(w => (
              <tr key={w.id} className="text-sm hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="font-black text-slate-800 text-base">{w.en}</div>
                  <div className="text-slate-400 font-bold">{w.ja}</div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < w.repetitions ? 'bg-indigo-500' : 'bg-slate-200'}`}></div>
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-indigo-400 uppercase">{w.repetitions} Level</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                   <span className={`text-[10px] font-black px-2 py-1 rounded-md tracking-wider ${w.nextReviewDate <= Date.now() ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
                     {w.nextReviewDate <= Date.now() ? 'NOW DUE' : new Date(w.nextReviewDate).toLocaleDateString()}
                   </span>
                </td>
                <td className="px-8 py-6 text-center">
                  <button onClick={() => onDeleteWord(w.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-2">
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Settings Tab ---
function SettingsTab({ settings, setSettings }) {
  return (
    <div className="bg-white p-10 rounded-3xl border border-slate-100 max-w-xl mx-auto shadow-sm">
      <h2 className="font-black text-2xl mb-10 text-slate-800 tracking-tight">環境設定</h2>
      <div className="space-y-10">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">デイリーリセット時刻</label>
          <input type="time" value={settings.reviewTime} onChange={(e) => setSettings(p => ({...p, reviewTime: e.target.value}))} className="p-5 border-2 border-slate-50 rounded-2xl w-full bg-slate-50 font-black text-indigo-600 focus:border-indigo-400 outline-none transition-all" />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">復習間隔（日数）</label>
          <div className="grid grid-cols-2 gap-4">
            {settings.intervals.map((v, i) => (
              <div key={i} className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 group-focus-within:text-indigo-300">STEP {i+1}</span>
                <input type="number" value={v} onChange={(e) => {
                    const next = [...settings.intervals];
                    next[i] = parseInt(e.target.value) || 1;
                    setSettings(p => ({...p, intervals: next}));
                }} className="w-full p-5 pl-20 border-2 border-slate-50 rounded-2xl font-black bg-slate-50 focus:border-indigo-400 outline-none transition-all" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}