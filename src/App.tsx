import React, { useState, useEffect } from 'react';
import { QUIZ_DATABASE, Question } from './data/quizData';
import { CompletedExamInfo } from './types';
import { SetupView } from './components/SetupView';
import { LabLinkCard } from './components/LabLinkCard';
import { QuestionView } from './components/QuestionView';
import { ResultView } from './components/ResultView';
import { SearchModal } from './components/SearchModal';
import { sound } from './utils/audio';

type ViewMode = 'setup' | 'quiz' | 'result';

const ALL_ROUNDS_KEY = 'ALL';

export default function App() {
  const [view, setView] = useState<ViewMode>('setup');
  const [selectedYear, setSelectedYear] = useState<string>('2026-42');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Array<{ selected: number; correct: boolean } | null>>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [bookmarkedIndices, setBookmarkedIndices] = useState<number[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [savedWrongPool, setSavedWrongPool] = useState<Question[]>([]);
  const [gradingMode, setGradingMode] = useState<'instant' | 'exam'>('instant');
  const [completedExams, setCompletedExams] = useState<Record<string, CompletedExamInfo>>({});
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Load saved sound preference, wrong pool, and completed exams on mount
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

      const savedCompleted = localStorage.getItem('auto_quiz_completed_rounds');
      if (savedCompleted) {
        setCompletedExams(JSON.parse(savedCompleted));
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

  const recordCompletedExam = (
    currentAnswers: Array<{ selected: number; correct: boolean } | null>,
    questions: Question[],
    roundKey: string
  ) => {
    const total = questions.length;
    if (total === 0) return;
    const correctCount = currentAnswers.filter(a => a?.correct).length;
    const scorePercent = Math.round((correctCount / total) * 100);
    const isPassed = scorePercent >= 60;
    const mode = total === 20 ? 'quick20' : 'full';

    setCompletedExams(prev => {
      const existing = prev[roundKey];
      const updated: Record<string, CompletedExamInfo> = {
        ...prev,
        [roundKey]: {
          lastCompletedAt: new Date().toISOString(),
          scorePercent,
          correctCount,
          totalCount: total,
          isPassed,
          mode,
          timesTaken: (existing?.timesTaken || 0) + 1,
          bestScore: Math.max(scorePercent, existing?.bestScore || 0)
        }
      };
      try {
        localStorage.setItem('auto_quiz_completed_rounds', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const handleStartQuiz = (
    yearKey: string, 
    studyMode: 'full' | 'quick20' | 'wrongOnly', 
    chosenGradingMode: 'instant' | 'exam' = 'instant'
  ) => {
    setSelectedYear(yearKey);
    setGradingMode(chosenGradingMode);

    const baseSet: Question[] =
      yearKey === ALL_ROUNDS_KEY
        ? Object.values(QUIZ_DATABASE).flatMap(set => set.questions)
        : QUIZ_DATABASE[yearKey].questions;

    let qList: Question[] = [];
    if (studyMode === 'wrongOnly') {
      qList = savedWrongPool.length > 0 ? [...savedWrongPool] : [...baseSet];
    } else if (studyMode === 'quick20') {
      // Pick 20 questions evenly distributed
      const step = baseSet.length / 20;
      qList = Array.from({ length: 20 }, (_, i) => baseSet[Math.floor(i * step)]);
    } else {
      qList = [...baseSet];
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

  const handleFinishQuiz = () => {
    recordCompletedExam(answers, activeQuestions, selectedYear);
    setView('result');
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleFinishQuiz();
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
    // Clear all saved wrong pools, completed exam records and cached answer records
    setSavedWrongPool([]);
    setCompletedExams({});
    setAnswers(new Array(activeQuestions.length).fill(null));
    setCurrentIndex(0);
    setBookmarkedIndices([]);
    try {
      localStorage.removeItem('auto_quiz_completed_rounds');
      localStorage.removeItem('auto_quiz_wrongs_v2');
      localStorage.removeItem('auto_quiz_wrongs');
    } catch {
      // Ignore
    }
  };

  const handleGoHome = () => {
    setView('setup');
  };

  const handleSelectQuestionFromSearch = (roundKey: string, question: Question) => {
    setSelectedYear(roundKey);
    const roundQuestions = QUIZ_DATABASE[roundKey]?.questions || [];
    const targetIdx = roundQuestions.findIndex(q => q.q === question.q && q.n === question.n);

    setActiveQuestions(roundQuestions);
    setAnswers(new Array(roundQuestions.length).fill(null));
    setCurrentIndex(targetIdx >= 0 ? targetIdx : 0);
    setBookmarkedIndices([]);
    setView('quiz');
  };

  const yearLabel =
    selectedYear === ALL_ROUNDS_KEY
      ? '2019~2026 전체 통합 모의고사'
      : QUIZ_DATABASE[selectedYear]?.label || `${selectedYear}년도`;

  return (
    <main className="min-h-screen bg-[#242426] text-[#2c2b29] flex flex-col items-center justify-start pb-12">
      {/* Outer Desk Ambient Mat */}
      <div className="w-full max-w-4xl pt-4 sm:pt-6">
        {view === 'setup' && (
          <SetupView
            onStartQuiz={handleStartQuiz}
            savedWrongCount={savedWrongPool.length}
            completedExams={completedExams}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            onResetAllData={handleResetAllData}
            onOpenSearch={() => setIsSearchOpen(true)}
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
            onFinishQuiz={handleFinishQuiz}
            onExit={handleGoHome}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            bookmarkedIndices={bookmarkedIndices}
            onToggleBookmark={handleToggleBookmark}
            onResetAllData={handleResetAllData}
            onOpenSearch={() => setIsSearchOpen(true)}
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

        {/* Global Search Modal */}
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectQuestion={handleSelectQuestionFromSearch}
          completedExams={completedExams}
        />
      </div>
    </main>
  );
}
