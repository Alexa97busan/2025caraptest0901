import React, { useState, useEffect } from 'react';
import { QUIZ_DATABASE, Question } from './data/quizData';
import { SetupView } from './components/SetupView';
import { LabLinkCard } from './components/LabLinkCard';
import { QuestionView } from './components/QuestionView';
import { ResultView } from './components/ResultView';
import { sound } from './utils/audio';

type ViewMode = 'setup' | 'quiz' | 'result';

export default function App() {
  const [view, setView] = useState<ViewMode>('setup');
  const [selectedYear, setSelectedYear] = useState<string>('2024');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Array<{ selected: number; correct: boolean } | null>>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [bookmarkedIndices, setBookmarkedIndices] = useState<number[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [savedWrongPool, setSavedWrongPool] = useState<Question[]>([]);
  const [gradingMode, setGradingMode] = useState<'instant' | 'exam'>('instant');

  // Load saved sound preference and wrong pool on mount (with versioning & DB synchronization)
  useEffect(() => {
    try {
      const DB_VERSION = 'v2_2026';
      const storedVersion = localStorage.getItem('auto_quiz_version');
      const savedSound = localStorage.getItem('auto_quiz_sound');
      if (savedSound !== null) {
        const isEnabled = savedSound === 'true';
        setSoundEnabled(isEnabled);
        sound.enabled = isEnabled;
      }

      const savedWrongs = localStorage.getItem('auto_quiz_wrongs_v2') || localStorage.getItem('auto_quiz_wrongs');
      if (savedWrongs) {
        const parsed: Question[] = JSON.parse(savedWrongs);
        // Synchronize each saved wrong question with the canonical latest QUIZ_DATABASE question
        const allCanonicalQuestions = Object.values(QUIZ_DATABASE).flatMap(set => set.questions);
        const syncedWrongs = parsed.map(item => {
          const canonical = allCanonicalQuestions.find(q => q.q === item.q);
          return canonical ? { ...canonical } : item;
        });
        setSavedWrongPool(syncedWrongs);
        localStorage.setItem('auto_quiz_wrongs_v2', JSON.stringify(syncedWrongs));
      }

      if (storedVersion !== DB_VERSION) {
        localStorage.setItem('auto_quiz_version', DB_VERSION);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    try {
      localStorage.setItem('auto_quiz_sound', String(next));
    } catch {
      // Ignore
    }
  };

  const handleStartQuiz = (
    yearKey: string, 
    studyMode: 'full' | 'quick20' | 'wrongOnly', 
    chosenGradingMode: 'instant' | 'exam' = 'instant'
  ) => {
    setSelectedYear(yearKey);
    setGradingMode(chosenGradingMode);

    let qList: Question[] = [];
    if (studyMode === 'wrongOnly') {
      qList = savedWrongPool.length > 0 ? [...savedWrongPool] : [...QUIZ_DATABASE[yearKey].questions];
    } else if (studyMode === 'quick20') {
      // Pick 20 questions evenly distributed
      const fullSet = QUIZ_DATABASE[yearKey].questions;
      const step = fullSet.length / 20;
      qList = Array.from({ length: 20 }, (_, i) => fullSet[Math.floor(i * step)]);
    } else {
      qList = [...QUIZ_DATABASE[yearKey].questions];
    }

    setActiveQuestions(qList);
    setAnswers(new Array(qList.length).fill(null));
    setCurrentIndex(0);
    setBookmarkedIndices([]);
    setView('quiz');
  };

  const handleSelectAnswer = (qIndex: number, choiceIndex: number) => {
    const q = activeQuestions[qIndex];
    const isCorrect = choiceIndex === q.answer;

    const newAnswers = [...answers];
    newAnswers[qIndex] = { selected: choiceIndex, correct: isCorrect };
    setAnswers(newAnswers);

    // If incorrect, add to wrong questions pool
    if (!isCorrect) {
      setSavedWrongPool(prev => {
        const exists = prev.some(item => item.q === q.q);
        const updated = exists ? prev : [...prev, q];
        try {
          localStorage.setItem('auto_quiz_wrongs_v2', JSON.stringify(updated));
        } catch {
          // Ignore
        }
        return updated;
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setView('result');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleJumpToIndex = (idx: number) => {
    if (idx >= 0 && idx < activeQuestions.length) {
      setCurrentIndex(idx);
    }
  };

  const handleToggleBookmark = (idx: number) => {
    setBookmarkedIndices(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
    sound.playPencilMark();
  };

  const handleRetryWrongOnly = () => {
    const wrongList = activeQuestions.filter((_, idx) => answers[idx] && !answers[idx]?.correct);
    if (wrongList.length === 0) return;

    setActiveQuestions(wrongList);
    setAnswers(new Array(wrongList.length).fill(null));
    setCurrentIndex(0);
    setBookmarkedIndices([]);
    setView('quiz');
  };

  const handleRestartAll = () => {
    setAnswers(new Array(activeQuestions.length).fill(null));
    setCurrentIndex(0);
    setBookmarkedIndices([]);
    setView('quiz');
  };

  const handleResetAllData = () => {
    // Clear all saved wrong pools and cached answer records
    setSavedWrongPool([]);
    setAnswers(new Array(activeQuestions.length).fill(null));
    setCurrentIndex(0);
    setBookmarkedIndices([]);
    try {
      localStorage.removeItem('auto_quiz_wrongs_v2');
      localStorage.removeItem('auto_quiz_wrongs');
    } catch {
      // Ignore
    }
  };

  const handleGoHome = () => {
    setView('setup');
  };

  const yearLabel = QUIZ_DATABASE[selectedYear]?.label || `${selectedYear}년도`;

  return (
    <main className="min-h-screen bg-[#242426] text-[#2c2b29] flex flex-col items-center justify-start pb-12">
      {/* Outer Desk Ambient Mat */}
      <div className="w-full max-w-4xl pt-4 sm:pt-6">
        {view === 'setup' && (
          <SetupView
            onStartQuiz={handleStartQuiz}
            savedWrongCount={savedWrongPool.length}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            onResetAllData={handleResetAllData}
          />
        )}
        {view === 'setup' && <LabLinkCard />}

        {view === 'quiz' && (
          <QuestionView
            yearKey={selectedYear}
            yearLabel={yearLabel}
            questions={activeQuestions}
            currentIndex={currentIndex}
            answers={answers}
            gradingMode={gradingMode}
            onSelectAnswer={handleSelectAnswer}
            onNext={handleNext}
            onPrev={handlePrev}
            onJumpToIndex={handleJumpToIndex}
            onFinishQuiz={() => setView('result')}
            onExit={handleGoHome}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            bookmarkedIndices={bookmarkedIndices}
            onToggleBookmark={handleToggleBookmark}
            onResetAllData={handleResetAllData}
          />
        )}

        {view === 'result' && (
          <ResultView
            yearLabel={yearLabel}
            questions={activeQuestions}
            answers={answers}
            onRetryWrongOnly={handleRetryWrongOnly}
            onRestartAll={handleRestartAll}
            onGoHome={handleGoHome}
          />
        )}
      </div>
    </main>
  );
}
