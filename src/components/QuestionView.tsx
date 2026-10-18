import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Bookmark, 
  FileSpreadsheet, 
  Pencil, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Search
} from 'lucide-react';
import { Question } from '../data/quizData';
import { RedPenCircle, RedPenSlash, RedPenCheckMark } from './RedPenCircle';
import { StampBadge } from './StampBadge';
import { ScratchPad } from './ScratchPad';
import { OmrSheet } from './OmrSheet';
import { QuestionDiagram } from './QuestionDiagram';
import { sound } from '../utils/audio';
import { haptics } from '../utils/haptics';

interface QuestionViewProps {
  yearKey: string;
  yearLabel: string;
  questions: Question[];
  currentIndex: number;
  answers: Array<{ selected: number; correct: boolean } | null>;
  gradingMode: 'instant' | 'exam';
  onSelectAnswer: (questionIndex: number, choiceIndex: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onJumpToIndex: (idx: number) => void;
  onFinishQuiz: () => void;
  onExit: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  bookmarkedIndices: number[];
  onToggleBookmark: (idx: number) => void;
  onResetAllData: () => void;
  onOpenSearch: () => void;
}

export const QuestionView: React.FC<QuestionViewProps> = ({
  yearKey,
  yearLabel,
  questions,
  currentIndex,
  answers,
  gradingMode,
  onSelectAnswer,
  onNext,
  onPrev,
  onJumpToIndex,
  onFinishQuiz,
  onExit,
  soundEnabled,
  onToggleSound,
  bookmarkedIndices,
  onToggleBookmark,
  onResetAllData,
  onOpenSearch
}) => {
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [showOmr, setShowOmr] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const currentQ = questions[currentIndex];
  const currentAns = answers[currentIndex];
  const total = questions.length;
  const isAnswered = currentAns !== null;
  const isBookmarked = bookmarkedIndices.includes(currentIndex);
  const isExamMode = gradingMode === 'exam';

  const handleChoiceClick = (choiceIdx: number) => {
    // In instant mode, lock after answer. In exam mode, allow modifying answer like real exam!
    if (!isExamMode && isAnswered) return;

    const isCorrect = choiceIdx === currentQ.answer;
    onSelectAnswer(currentIndex, choiceIdx);

    if (isExamMode) {
      // In real exam mode, simple pencil marking sound and haptic tap without giving away answer
      sound.playPencilMark();
      haptics.triggerTap();
    } else {
      if (isCorrect) {
        sound.playRedPenCircle();
        sound.playCorrectChime();
        haptics.triggerCorrect();

        // Launch joyful celebratory confetti!
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#dc2626', '#f59e0b', '#10b981', '#3b82f6', '#ec4899']
        });
      } else {
        sound.playPencilMark();
        haptics.triggerWrong();
      }
    }
  };

  const answeredCount = answers.filter(Boolean).length;
  const progressPercent = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto py-4 px-3 sm:px-4">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
        <button
          onClick={onExit}
          className="flex items-center gap-1 px-3 py-1.5 whitespace-nowrap rounded-full bg-(--a-fill) hover:bg-(--a-fill-2) text-(--a-label) font-medium transition-colors border border-(--a-sep)"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> 종료
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenSearch}
            title="900문항 기출문제 검색"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-(--a-card) hover:bg-(--a-fill) text-(--a-label) font-medium border border-(--a-sep) shadow-2xs transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-(--a-accent)" />
            <span className="hidden sm:inline">문제 검색</span>
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            title="처음부터 다시 풀기 (모든 풀이 및 오답 데이터 초기화)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-(--a-fill) hover:bg-(--a-fill-2) text-(--a-red) font-medium border border-(--a-sep) shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">처음부터 리셋</span>
          </button>

          <button
            onClick={() => setShowScratchpad(true)}
            className="flex items-center gap-1 px-3 py-1.5 whitespace-nowrap rounded-full bg-(--a-card) hover:bg-(--a-fill) text-(--a-label) font-medium border border-(--a-sep) shadow-2xs transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-(--a-accent)" />
            <span>연습장</span>
          </button>

          <button
            onClick={() => setShowOmr(true)}
            className="flex items-center gap-1 px-3 py-1.5 whitespace-nowrap rounded-full bg-(--a-accent) hover:opacity-90 text-white font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>OMR 카드</span>
          </button>

          <button
            onClick={onToggleSound}
            className="p-1.5 rounded-full bg-(--a-fill) hover:bg-(--a-fill-2) text-(--a-label) transition-colors border border-(--a-sep) cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-(--a-accent)" /> : <VolumeX className="w-4 h-4 text-(--a-label-3)" />}
          </button>
        </div>
      </div>

      {/* Progress & Meta Header */}
      <div className="mb-3 px-1">
        <div className="flex items-center justify-between text-xs font-mono-custom text-(--a-label-2) mb-1.5">
          <span className="font-bold font-serif-kr text-(--a-label)">
            {yearLabel}
          </span>
          <span>
            진행 문항: <strong className="text-(--a-label)">{currentIndex + 1}</strong> / {total} (완료 {answeredCount}개)
          </span>
        </div>

        {/* Vintage Progress Track */}
        <div className="w-full h-2 bg-(--a-fill-2) rounded-full overflow-hidden p-0.5 border border-(--a-sep)">
          <div
            className="h-full bg-(--a-accent) rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Test Paper Container (Styled like Binder Notebook / Gridded exam sheet) */}
      <div className="relative bg-(--a-card) paper-texture-grid rounded-2xl paper-shadow-vintage border border-(--a-sep) p-5 sm:p-7 overflow-hidden">

        {/* Question Header & Badges */}
        <div className="flex items-start justify-between gap-2 mt-2 mb-3">
          <div className="flex items-center flex-wrap gap-2">
            <span className="font-mono-custom font-bold text-sm px-2.5 py-0.5 bg-(--a-inverse-bg) text-(--a-inverse-fg) rounded">
              Q{currentQ.n}
            </span>

            {currentQ.category && (
              <span className="text-[11px] font-serif-kr px-2 py-0.5 bg-(--a-fill) border border-(--a-sep) text-(--a-label) rounded font-medium">
                {currentQ.category}
              </span>
            )}

            {currentQ.star && (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-serif-kr font-bold px-2 py-0.5 bg-(--a-red-soft) text-(--a-red) border border-(--a-red-line) rounded animate-pulse">
                <Star className="w-3 h-3 fill-red-500" /> 오답 다발 문항
              </span>
            )}
          </div>

          {/* Bookmark Toggle button */}
          <button
            onClick={() => onToggleBookmark(currentIndex)}
            className={`p-1.5 rounded-md transition-colors ${
              isBookmarked
                ? 'bg-(--a-yellow-soft) text-(--a-orange) border border-(--a-yellow-line)'
                : 'hover:bg-(--a-fill) text-(--a-label-2)'
            }`}
            title="나중에 다시 볼 문항 책갈피"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-(--a-orange)' : ''}`} />
          </button>
        </div>

        {/* Question Text */}
        <div className="relative mb-4">
          <h2 className="font-serif-kr text-base sm:text-lg font-bold text-(--a-label) leading-relaxed tracking-tight">
            {currentQ.q}
          </h2>

          {/* Graded stamp if solved (Only in instant mode) */}
          {!isExamMode && isAnswered && (
            <div className="absolute -top-3 right-0 pointer-events-none z-20">
              {currentAns.correct ? (
                <StampBadge type="praise" />
              ) : (
                <div className="px-3 py-1 bg-(--a-red-soft) rounded-full text-(--a-red) font-semibold text-sm animate-stamp">
                  다시 확인
                </div>
              )}
            </div>
          )}
        </div>

        {/* Question Diagram / Illustration if present */}
        {currentQ.diagram && (
          <QuestionDiagram type={currentQ.diagram} />
        )}

        {/* Options List */}
        <div className="space-y-2.5 mb-6">
          {currentQ.opts.map((opt, optIdx) => {
            const isUserSelected = currentAns?.selected === optIdx;
            const isCorrectOption = optIdx === currentQ.answer;

            let btnStateStyle = 'bg-(--a-card) border-(--a-sep) text-(--a-label) hover:bg-(--a-fill) hover:border-(--a-sep)';
            
            if (isExamMode) {
              // Real exam mode: only highlight what user selected with dark pencil mark, without showing correct/incorrect
              if (isUserSelected) {
                btnStateStyle = 'bg-(--a-accent-soft) border-(--a-accent) text-(--a-label) font-semibold';
              }
            } else if (isAnswered) {
              // Instant practice mode: show red pen grading & green/red styling
              if (isCorrectOption) {
                btnStateStyle = 'bg-(--a-green-soft) border-(--a-green) text-(--a-green) font-semibold';
              } else if (isUserSelected && !currentAns.correct) {
                btnStateStyle = 'bg-(--a-red-soft) border-(--a-red-line) text-(--a-red)';
              } else {
                btnStateStyle = 'bg-(--a-card)/60 border-(--a-sep) text-(--a-label-2) opacity-70';
              }
            }

            return (
              <button
                key={optIdx}
                disabled={!isExamMode && isAnswered}
                onClick={() => handleChoiceClick(optIdx)}
                className={`relative w-full text-left p-3 sm:p-3.5 rounded-xl border-2 transition-all flex items-start gap-3 cursor-pointer ${
                  !isExamMode && isAnswered ? 'disabled:cursor-default' : ''
                } ${btnStateStyle}`}
              >
                {/* Option Number Bubble */}
                <div className="relative flex-shrink-0 mt-0.5">
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center font-mono-custom text-xs font-bold ${
                      isExamMode
                        ? isUserSelected
                          ? 'bg-(--a-accent) text-white border-(--a-accent)'
                          : 'bg-(--a-card)/80 border-(--a-sep) text-(--a-label)'
                        : isAnswered && isCorrectOption
                        ? 'bg-(--a-green) text-white border-(--a-green)'
                        : isUserSelected && !currentAns?.correct
                        ? 'bg-(--a-red) text-white border-(--a-red)'
                        : 'bg-(--a-card)/80 border-(--a-sep) text-(--a-label)'
                    }`}
                  >
                    {optIdx + 1}
                  </div>

                  {/* Red Pen Circle Animation when Correct (Instant Mode Only)! */}
                  {!isExamMode && isAnswered && isCorrectOption && (
                    <RedPenCircle variant="double-loop" />
                  )}

                  {/* Red Pen Slash Animation when Incorrect (Instant Mode Only)! */}
                  {!isExamMode && isAnswered && isUserSelected && !currentAns?.correct && (
                    <RedPenSlash />
                  )}
                </div>

                {/* Option Text */}
                <div className="flex-1 font-serif-kr text-sm sm:text-base leading-snug">
                  {opt}
                </div>

                {/* Status Indicator Icon (Instant Mode Only) */}
                {!isExamMode && isAnswered && isCorrectOption && (
                  <CheckCircle2 className="w-5 h-5 text-(--a-green) flex-shrink-0 mt-0.5" />
                )}
                {!isExamMode && isAnswered && isUserSelected && !currentAns?.correct && (
                  <AlertCircle className="w-5 h-5 text-(--a-red) flex-shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Detailed Explanation / Examiner Margin Note (Only in Instant Practice Mode) */}
        {!isExamMode && isAnswered && (
          <div className="relative mt-5 p-4 sm:p-5 bg-(--a-fill) rounded-xl border border-(--a-sep) shadow-xs animate-fadeIn">
            {/* Red pen annotation header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-(--a-sep)">
              <div className="flex items-center gap-1.5">
                <span className="font-hand text-lg font-bold text-(--a-red)">
                  해설
                </span>
                <span className="text-[11px] font-mono-custom text-(--a-label-2)">
                  [ 정답: {currentQ.answer + 1}번 ]
                </span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                currentAns.correct ? 'bg-(--a-green-soft) text-(--a-green)' : 'bg-(--a-red-soft) text-(--a-red)'
              }`}>
                {currentAns.correct ? '정답입니다 (+100)' : '오답 (체크 필요)'}
              </span>
            </div>

            {/* Explanation Note Content */}
            <p className="font-serif-kr text-xs sm:text-sm text-(--a-label) leading-relaxed whitespace-pre-line">
              {currentQ.note}
            </p>
          </div>
        )}

        {/* Real Exam Mode Guidance Hint Banner */}
        {isExamMode && (
          <div className="mt-4 p-3 bg-(--a-fill) rounded-xl border border-(--a-sep) flex items-center justify-between text-xs text-(--a-label-2)">
            <span className="font-serif-kr">
              <strong>실전 모드</strong> · 정답과 해설은 시험 제출 후 성적표에서 일괄 채점됩니다.
            </span>
            <span className="font-hand font-bold text-(--a-label-2)">
              (답안 수정 가능)
            </span>
          </div>
        )}

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-(--a-sep)">
          <button
            id="prevQuestionBtn"
            disabled={currentIndex === 0}
            onClick={() => {
              sound.playPageTurn();
              haptics.triggerPageTurn();
              onPrev();
            }}
            className="flex items-center gap-1 px-4 py-2.5 rounded-full border border-(--a-sep) bg-(--a-card) hover:bg-(--a-fill) disabled:opacity-30 disabled:cursor-not-allowed font-medium text-xs sm:text-sm text-(--a-label) transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> 이전 문항
          </button>

          {currentIndex === total - 1 ? (
            <button
              id="finishQuizBtn"
              onClick={() => {
                sound.playStampSound();
                haptics.triggerFinish();
                onFinishQuiz();
              }}
              className="flex items-center gap-1 px-6 py-2.5 rounded-full bg-(--a-accent) hover:opacity-90 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
            >
              <span>시험 채점 결과 보기</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="nextQuestionBtn"
              onClick={() => {
                sound.playPageTurn();
                haptics.triggerPageTurn();
                onNext();
              }}
              className="flex items-center gap-1 px-5 py-2.5 rounded-full bg-(--a-accent) hover:opacity-90 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
            >
              <span>다음 문항</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Scratchpad Modal */}
      {showScratchpad && (
        <ScratchPad onClose={() => setShowScratchpad(false)} />
      )}

      {/* Interactive OMR Sheet Modal */}
      {showOmr && (
        <OmrSheet
          questions={questions}
          answers={answers}
          currentIndex={currentIndex}
          onSelectIndex={onJumpToIndex}
          onClose={() => setShowOmr(false)}
          yearLabel={yearLabel}
          gradingMode={gradingMode}
        />
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-(--a-card) paper-texture-ivory rounded-2xl paper-shadow-vintage border-2 border-(--a-sep) p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-(--a-red-soft) border border-(--a-red-line) flex items-center justify-center mx-auto mb-3.5 text-(--a-red)">
              <RotateCcw className="w-6 h-6 animate-spin-slow" />
            </div>
            
            <h3 className="font-serif-kr font-bold text-lg text-(--a-label) mb-1.5">
              처음부터 다시 풀기
            </h3>
            
            <p className="font-serif-kr text-xs text-(--a-label-2) leading-relaxed mb-5">
              현재 시험지의 마킹 및 전체 정답/오답 풀이 기록을 깨끗이 지우고 1번 문항부터 새롭게 시작합니다. 계속하시겠습니까?
            </p>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-(--a-sep) bg-(--a-fill) hover:bg-(--a-fill-2) text-(--a-label) font-serif-kr text-xs font-semibold cursor-pointer transition-colors"
              >
                계속 풀기
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  sound.playEraserSound();
                  onResetAllData();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl border border-(--a-red) bg-(--a-red) hover:bg-(--a-red) text-white font-serif-kr text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                전체 초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
