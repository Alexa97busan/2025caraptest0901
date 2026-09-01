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
  RotateCcw
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
  onResetAllData
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
      <div className="flex items-center justify-between mb-3 text-xs">
        <button
          onClick={onExit}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#e8e1d2] hover:bg-[#d9d0bf] text-[#42372c] font-medium transition-colors border border-[#cec3af]"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> 시험 종료 / 메인
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowResetConfirm(true)}
            title="처음부터 다시 풀기 (모든 풀이 및 오답 데이터 초기화)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#e8e1d2] hover:bg-[#d9d0bf] text-[#782828] font-medium border border-[#cec3af] shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">처음부터 리셋</span>
          </button>

          <button
            onClick={() => setShowScratchpad(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#faf7ef] hover:bg-[#f1ebe0] text-[#332b23] font-medium border border-[#cfc4b0] shadow-2xs transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-[#c2410c]" />
            <span>풀이 연습장</span>
          </button>

          <button
            onClick={() => setShowOmr(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#d92424] hover:bg-[#b91c1c] text-white font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>OMR 카드</span>
          </button>

          <button
            onClick={onToggleSound}
            className="p-1.5 rounded-lg bg-[#e8e1d2] hover:bg-[#d9d0bf] text-[#42372c] transition-colors border border-[#cec3af] cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#b91c1c]" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
          </button>
        </div>
      </div>

      {/* Progress & Meta Header */}
      <div className="mb-3 px-1">
        <div className="flex items-center justify-between text-xs font-mono-custom text-[#5c5042] mb-1.5">
          <span className="font-bold font-serif-kr text-[#2c241b]">
            {yearLabel}
          </span>
          <span>
            진행 문항: <strong className="text-[#1f1b17]">{currentIndex + 1}</strong> / {total} (완료 {answeredCount}개)
          </span>
        </div>

        {/* Vintage Progress Track */}
        <div className="w-full h-2 bg-[#dcd3c1] rounded-full overflow-hidden p-0.5 border border-[#c4b9a3]">
          <div
            className="h-full bg-[#3d3429] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Test Paper Container (Styled like Binder Notebook / Gridded exam sheet) */}
      <div className="relative bg-[#faf7ef] paper-texture-grid rounded-2xl paper-shadow-vintage border-2 border-[#cfc3af] p-5 sm:p-7 overflow-hidden">
        
        {/* Binder Rings Simulation on Top (Image 1 style) */}
        <div className="absolute top-0 left-0 right-0 h-4 flex justify-around px-8 pointer-events-none">
          {[0, 1, 2, 3, 4].map(idx => (
            <div key={idx} className="w-3.5 h-3 bg-[#1e1d1f] rounded-b-md shadow-inner border-t border-[#333]" />
          ))}
        </div>

        {/* Washi tape on corner */}
        <div className="absolute -top-2 right-6 w-20 h-6 washi-tape transform rotate-2 pointer-events-none opacity-80 z-10" />

        {/* Question Header & Badges */}
        <div className="flex items-start justify-between gap-2 mt-2 mb-3">
          <div className="flex items-center flex-wrap gap-2">
            <span className="font-mono-custom font-bold text-sm px-2.5 py-0.5 bg-[#2b251e] text-[#f7f4ec] rounded">
              Q{currentQ.n}
            </span>

            {currentQ.category && (
              <span className="text-[11px] font-serif-kr px-2 py-0.5 bg-[#e8e0ce] border border-[#cec2ae] text-[#4d4032] rounded font-medium">
                {currentQ.category}
              </span>
            )}

            {currentQ.star && (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-serif-kr font-bold px-2 py-0.5 bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5] rounded animate-pulse">
                <Star className="w-3 h-3 fill-red-500" /> 오답 다발 문항
              </span>
            )}
          </div>

          {/* Bookmark Toggle button */}
          <button
            onClick={() => onToggleBookmark(currentIndex)}
            className={`p-1.5 rounded-md transition-colors ${
              isBookmarked
                ? 'bg-amber-100 text-amber-700 border border-amber-300'
                : 'hover:bg-[#eee6d5] text-[#8c7e6b]'
            }`}
            title="나중에 다시 볼 문항 책갈피"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-600' : ''}`} />
          </button>
        </div>

        {/* Question Text */}
        <div className="relative mb-4">
          <h2 className="font-serif-kr text-base sm:text-lg font-bold text-[#1f1b17] leading-relaxed tracking-tight">
            {currentQ.q}
          </h2>

          {/* Graded stamp if solved (Only in instant mode) */}
          {!isExamMode && isAnswered && (
            <div className="absolute -top-3 right-0 pointer-events-none z-20">
              {currentAns.correct ? (
                <StampBadge type="praise" />
              ) : (
                <div className="px-3 py-1 bg-red-50 border border-red-400 rounded text-red-700 font-hand font-bold text-sm transform rotate-3">
                  다시 확인 ⚠️
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

            let btnStateStyle = 'bg-[#f5f1e6] border-[#d8cdbc] text-[#2c241c] hover:bg-[#ede7d8] hover:border-[#b8a994]';
            
            if (isExamMode) {
              // Real exam mode: only highlight what user selected with dark pencil mark, without showing correct/incorrect
              if (isUserSelected) {
                btnStateStyle = 'bg-[#eee4d0] border-[#3d3328] text-[#1c1813] font-semibold ring-1 ring-[#3d3328]/30 shadow-2xs';
              }
            } else if (isAnswered) {
              // Instant practice mode: show red pen grading & green/red styling
              if (isCorrectOption) {
                btnStateStyle = 'bg-[#edf7ed] border-[#86efac] text-[#14532d] font-semibold';
              } else if (isUserSelected && !currentAns.correct) {
                btnStateStyle = 'bg-[#fef2f2] border-[#fca5a5] text-[#991b1b]';
              } else {
                btnStateStyle = 'bg-[#f5f1e6]/60 border-[#e3dacf] text-[#7a6e5e] opacity-70';
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
                          ? 'bg-[#2b251e] text-white border-[#1a1612] shadow-inner'
                          : 'bg-white/80 border-[#a89b87] text-[#4f4335]'
                        : isAnswered && isCorrectOption
                        ? 'bg-[#15803d] text-white border-[#166534]'
                        : isUserSelected && !currentAns?.correct
                        ? 'bg-[#b91c1c] text-white border-[#991b1b]'
                        : 'bg-white/80 border-[#a89b87] text-[#4f4335]'
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
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                )}
                {!isExamMode && isAnswered && isUserSelected && !currentAns?.correct && (
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Detailed Explanation / Examiner Margin Note (Only in Instant Practice Mode) */}
        {!isExamMode && isAnswered && (
          <div className="relative mt-5 p-4 sm:p-5 bg-[#fef9eb] paper-texture-lined rounded-xl border-2 border-[#e6d8bc] shadow-xs animate-fadeIn">
            {/* Red pen annotation header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#e2d2b0]">
              <div className="flex items-center gap-1.5">
                <span className="font-hand text-lg font-bold text-[#b91c1c]">
                  ✍️ 채점관 수기 해설 노트
                </span>
                <span className="text-[11px] font-mono-custom text-[#756653]">
                  [ 정답: {currentQ.answer + 1}번 ]
                </span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                currentAns.correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {currentAns.correct ? '정답입니다 (+100)' : '오답 (체크 필요)'}
              </span>
            </div>

            {/* Explanation Note Content */}
            <p className="font-serif-kr text-xs sm:text-sm text-[#382f25] leading-relaxed whitespace-pre-line">
              {currentQ.note}
            </p>
          </div>
        )}

        {/* Real Exam Mode Guidance Hint Banner */}
        {isExamMode && (
          <div className="mt-4 p-3 bg-[#f3ede1] rounded-xl border border-[#dcd1be] flex items-center justify-between text-xs text-[#635442]">
            <span className="font-serif-kr">
              🔒 <strong>진짜 시험 모드:</strong> 정답과 해설은 시험 제출 후 성적표에서 일괄 채점됩니다.
            </span>
            <span className="font-hand font-bold text-[#8a7a67]">
              (답안 수정 가능)
            </span>
          </div>
        )}

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-[#ded3be]">
          <button
            id="prevQuestionBtn"
            disabled={currentIndex === 0}
            onClick={() => {
              sound.playPageTurn();
              haptics.triggerPageTurn();
              onPrev();
            }}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-[#bfae98] bg-[#f5efe2] hover:bg-[#eae2d3] disabled:opacity-30 disabled:cursor-not-allowed font-medium text-xs sm:text-sm text-[#3d3328] transition-all cursor-pointer"
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
              className="flex items-center gap-1 px-6 py-2.5 rounded-xl bg-[#c2410c] hover:bg-[#9a3412] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
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
              className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-[#241f19] hover:bg-[#3d352b] text-[#faf7ee] font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
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
          <div className="w-full max-w-sm bg-[#faf7ef] paper-texture-ivory rounded-2xl paper-shadow-vintage border-2 border-[#d0c5b4] p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#fde8e8] border border-[#f5c2c2] flex items-center justify-center mx-auto mb-3.5 text-[#b91c1c]">
              <RotateCcw className="w-6 h-6 animate-spin-slow" />
            </div>
            
            <h3 className="font-serif-kr font-bold text-lg text-[#2a221b] mb-1.5">
              처음부터 다시 풀기
            </h3>
            
            <p className="font-serif-kr text-xs text-[#6e5f4e] leading-relaxed mb-5">
              현재 시험지의 마킹 및 전체 정답/오답 풀이 기록을 깨끗이 지우고 1번 문항부터 새롭게 시작합니다. 계속하시겠습니까?
            </p>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#cfc4b1] bg-[#ece5d5] hover:bg-[#e0d6c2] text-[#4d4032] font-serif-kr text-xs font-semibold cursor-pointer transition-colors"
              >
                계속 풀기
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  sound.playEraserSound();
                  onResetAllData();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#991b1b] bg-[#b91c1c] hover:bg-[#991b1b] text-white font-serif-kr text-xs font-bold shadow-xs cursor-pointer transition-colors"
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
