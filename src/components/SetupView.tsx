import React from 'react';
import { BookOpen, Award, Sparkles, CheckCircle2, RotateCcw, AlertTriangle, FileText, Volume2, VolumeX, Search } from 'lucide-react';
import { QUIZ_DATABASE } from '../data/quizData';
import { CompletedExamInfo } from '../types';
import { RedPenCheckMark } from './RedPenCircle';
import { sound } from '../utils/audio';

interface SetupViewProps {
  onStartQuiz: (yearKey: string, mode: 'full' | 'quick20' | 'wrongOnly', gradingMode: 'instant' | 'exam') => void;
  savedWrongCount: number;
  completedExams: Record<string, CompletedExamInfo>;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetAllData: () => void;
  onOpenSearch: () => void;
}

const ALL_ROUNDS_KEY = 'ALL';
const TOTAL_QUESTION_COUNT = Object.values(QUIZ_DATABASE).reduce((sum, s) => sum + s.total, 0);

export const SetupView: React.FC<SetupViewProps> = ({
  onStartQuiz,
  savedWrongCount,
  completedExams,
  soundEnabled,
  onToggleSound,
  onResetAllData,
  onOpenSearch
}) => {
  const [selectedYear, setSelectedYear] = React.useState<string>('2026-42');
  const [mode, setMode] = React.useState<'full' | 'quick20'>('full');
  const [gradingMode, setGradingMode] = React.useState<'instant' | 'exam'>('instant');
  const [showResetConfirm, setShowResetConfirm] = React.useState<boolean>(false);

  const handleYearClick = (year: string) => {
    setSelectedYear(year);
    sound.playPencilMark();
  };

  // Group exam rounds by year (most recent year first) for a compact folder-tab layout.
  const groupedByYear = React.useMemo(() => {
    const groups: Record<string, Array<{ key: string; label: string; total: number }>> = {};
    Object.entries(QUIZ_DATABASE).forEach(([key, set]) => {
      if (!groups[set.year]) groups[set.year] = [];
      groups[set.year].push({ key, label: set.label, total: set.total });
    });
    return Object.entries(groups).sort((a, b) => Number(b[0]) - Number(a[0]));
  }, []);

  const totalRoundsCount = Object.keys(QUIZ_DATABASE).length;
  const completedRoundsCount = Object.keys(completedExams).filter(k => k !== ALL_ROUNDS_KEY).length;

  const selectedLabel =
    selectedYear === ALL_ROUNDS_KEY
      ? '전체 통합 모의고사'
      : QUIZ_DATABASE[selectedYear]?.label || selectedYear;

  const selectedTotal =
    selectedYear === ALL_ROUNDS_KEY ? TOTAL_QUESTION_COUNT : QUIZ_DATABASE[selectedYear]?.total ?? 0;

  const handleStart = () => {
    sound.playPageTurn();
    onStartQuiz(selectedYear, mode, gradingMode);
  };

  const handleConfirmReset = () => {
    setShowResetConfirm(false);
    sound.playEraserSound();
    onResetAllData();
  };

  const allCompleted = completedExams[ALL_ROUNDS_KEY];

  return (
    <div className="w-full max-w-xl mx-auto py-6 px-4">
      {/* Folder Cover Container styled like Image 2 vintage manila file folder */}
      <div className="relative bg-[#f6f2e8] paper-texture-ivory rounded-2xl paper-shadow-vintage border-2 border-[#d0c6b3] p-6 sm:p-8 overflow-hidden">
        
        {/* Paper clip on top right (Image 2 style) */}
        <div className="absolute top-0 right-10 w-8 h-16 pointer-events-none z-20">
          <svg viewBox="0 0 40 80" className="w-full h-full paper-clip-shadow">
            <path
              d="M 15,2 L 15,60 C 15,70 25,70 25,60 L 25,12 C 25,6 10,6 10,12 L 10,68 C 10,78 30,78 30,68 L 30,22"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Vintage Tape Header Accent */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-36 h-7 washi-tape-yellow transform -rotate-1 pointer-events-none z-10 opacity-90"></div>

        {/* Brand & Document Meta */}
        <div className="flex items-start justify-between border-b-2 border-[#2b2722] pb-4 mb-6 pt-2">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-typewriter text-[11px] font-bold px-2 py-0.5 bg-[#e3dac9] border border-[#beb19d] text-[#554737] rounded">
                FILE NO: AUTO-2025
              </span>
              <span className="font-mono-custom text-[11px] text-[#7d6f5c]">
                국가공인 자격검정
              </span>
              {completedRoundsCount > 0 ? (
                <span className="inline-flex items-center gap-1 font-hand text-xs font-bold text-[#dc2626] bg-[#fef2f2] px-2 py-0.5 rounded-full border border-[#fca5a5]">
                  <RedPenCheckMark size="xs" animate={false} />
                  <span>{completedRoundsCount}/{totalRoundsCount}회차 응시 완료</span>
                </span>
              ) : (
                <span className="font-hand text-[11px] text-[#8c7e6c]">
                  ✏️ 회차 선택 후 실전 풀이 시작
                </span>
              )}
            </div>
            <h1 className="font-serif-kr text-2xl sm:text-3xl font-bold text-[#1f1b17] tracking-tight">
              자동차진단평가사 2급
            </h1>
            <p className="font-hand text-base text-[#685947] mt-0.5">
              기출문제 실전 수기 필기 노트 (2019~2026년 15개 회차 · 900문항)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSearch}
              title="900문항 기출문제 키워드 검색"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2b251e] hover:bg-[#3d342a] text-[#faf7ee] transition-all border border-[#1b1713] text-xs font-serif-kr cursor-pointer shadow-xs"
            >
              <Search className="w-3.5 h-3.5 text-[#fbbf24]" />
              <span className="font-bold">문제 검색</span>
            </button>

            <button
              onClick={() => setShowResetConfirm(true)}
              title="문제 풀이 기록 및 오답 데이터 초기화"
              className="flex items-center gap-1 px-2.5 py-2 rounded-lg bg-[#f0e7d7] hover:bg-[#e4d7c0] text-[#782828] transition-colors border border-[#d8c7b0] text-xs font-serif-kr cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>기록 리셋</span>
            </button>

            <button
              onClick={onToggleSound}
              title={soundEnabled ? '효과음 끄기' : '효과음 켜기'}
              className="p-2 rounded-lg bg-[#ede4d3] hover:bg-[#e2d6c2] text-[#4f4335] transition-colors border border-[#ccbfae] cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-[#b91c1c]" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
            </button>
          </div>
        </div>

        {/* Quick Search Interactive Bar */}
        <div className="mb-6">
          <button
            onClick={onOpenSearch}
            className="w-full p-3.5 bg-[#fffdf9] hover:bg-[#faf6ee] border-2 border-[#d5cabb] hover:border-[#c2410c] rounded-xl flex items-center justify-between text-left transition-all shadow-2xs group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-[#736453]">
              <Search className="w-4 h-4 text-[#c2410c] group-hover:scale-110 transition-transform" />
              <span className="font-serif-kr text-xs sm:text-sm text-[#8c7b68] group-hover:text-[#382f25]">
                궁금한 단어나 키워드로 문제 검색 (예: 차대번호, 프런트 펜더, 침수...)
              </span>
            </div>
            <span className="font-mono-custom text-[11px] font-bold px-2 py-1 bg-[#ede4d4] border border-[#d2c4af] text-[#554737] rounded group-hover:bg-[#c2410c] group-hover:text-white group-hover:border-[#c2410c] transition-colors">
              검색 열기 ↵
            </span>
          </button>
        </div>

        {/* Year / Round Selection Box */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif-kr font-bold text-sm text-[#382f25] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#c2410c]" /> 검정 연도 · 회차 선택
            </h2>
            <span className="text-[11px] font-mono-custom text-[#7d6e5b]">
              합격 기준 60점 (60% 이상)
            </span>
          </div>

          {/* All-rounds combined mega button */}
          <button
            onClick={() => handleYearClick(ALL_ROUNDS_KEY)}
            className={`w-full mb-4 p-4 text-left rounded-xl border-2 transition-all duration-150 ${
              selectedYear === ALL_ROUNDS_KEY
                ? 'bg-[#1f1b17] border-[#1f1b17] shadow-sm ring-1 ring-[#c2410c]/40'
                : 'bg-[#2b251e] border-[#2b251e] hover:bg-[#3a3226]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-serif-kr font-bold text-[#faf7ee] text-sm flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#fbbf24]" /> 2019~2026 전체 통합 모의고사
                </div>
                <div className="text-[11px] font-mono-custom text-[#c9bea9] mt-1">
                  15개 회차 · 총 {TOTAL_QUESTION_COUNT}문항 랜덤 없이 순서대로 수록
                </div>
                {allCompleted && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="inline-flex items-center gap-1 font-hand text-xs font-bold text-[#fca5a5] bg-[#3f1515] px-2 py-0.5 rounded border border-[#7f1d1d]">
                      <RedPenCheckMark size="xs" animate={false} />
                      <span>응시 완료 · 최고 {allCompleted.bestScore}점 ({allCompleted.timesTaken}회 풀이)</span>
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {allCompleted && (
                  <div className="p-1 rounded bg-[#3f1515] border border-[#7f1d1d]">
                    <RedPenCheckMark size="sm" animate={false} />
                  </div>
                )}
                {selectedYear === ALL_ROUNDS_KEY && (
                  <CheckCircle2 className="w-5 h-5 text-[#fbbf24] flex-shrink-0" />
                )}
              </div>
            </div>
          </button>

          {/* Year-grouped round chips */}
          <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1">
            {groupedByYear.map(([year, rounds]) => (
              <div key={year}>
                <div className="text-[11px] font-mono-custom font-bold text-[#8a7b69] mb-1.5 px-0.5">
                  {year}년
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {rounds.map((item) => {
                    const isSelected = selectedYear === item.key;
                    const completedInfo = completedExams[item.key];
                    const isCompleted = !!completedInfo;

                    return (
                      <button
                        key={item.key}
                        onClick={() => handleYearClick(item.key)}
                        className={`relative p-3 text-left rounded-xl border-2 transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-[#fef7ee] border-[#c2410c] shadow-sm ring-1 ring-[#c2410c]/30'
                            : isCompleted
                              ? 'bg-[#fcf9f2] border-[#dfd4c4] hover:border-[#b8a994] hover:bg-[#f5f0e3]'
                              : 'bg-[#faf7ef] border-[#d8cebe] hover:border-[#b8a994] hover:bg-[#f5f0e3]'
                        }`}
                      >
                        {/* Red pen checkmark indicator for completed exams */}
                        {isCompleted && (
                          <div 
                            title={`응시 완료: 최고 ${completedInfo.bestScore}점 (${completedInfo.timesTaken}회 응시)`}
                            className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#fef2f2] border border-[#fca5a5] shadow-2xs"
                          >
                            <RedPenCheckMark size="xs" animate={false} />
                            <span className="font-hand font-bold text-[#dc2626] text-[11px] leading-none">
                              {completedInfo.bestScore}점
                            </span>
                          </div>
                        )}

                        {/* Selected indicator dot if not completed or placed alongside */}
                        {isSelected && !isCompleted && (
                          <div className="absolute top-2 right-2">
                            <span className="w-2 h-2 rounded-full bg-[#c2410c] inline-block animate-pulse"></span>
                          </div>
                        )}

                        <div className={`text-xs font-serif-kr font-bold text-[#1f1b17] leading-snug ${isCompleted ? 'pr-14' : 'pr-3'}`}>
                          {item.label.replace(`${year}년 `, '')}
                        </div>

                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-[#e8dfcf]/70">
                          <span className="text-[10px] font-mono-custom text-[#8a7b69]">
                            총 {item.total}문항
                          </span>
                          {isCompleted ? (
                            <span className={`font-hand text-[11px] font-bold ${completedInfo.isPassed ? 'text-[#b91c1c]' : 'text-[#c2410c]'}`}>
                              {completedInfo.isPassed ? '✓ 합격' : '✓ 응시'}
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono-custom text-[#a89b88]">
                              미응시
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Study Mode Selector */}
        <div className="mb-4 p-4 bg-[#ede6d5]/70 rounded-xl border border-[#d6cab7]">
          <label className="font-serif-kr font-bold text-xs text-[#3d3328] block mb-2.5">
            📝 문제 풀이 분량
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                setMode('full');
                sound.playPencilMark();
              }}
              className={`p-2.5 rounded-lg font-medium border text-center transition-all cursor-pointer ${
                mode === 'full'
                  ? 'bg-white border-[#2b2722] text-[#1f1b17] shadow-2xs font-bold'
                  : 'bg-transparent border-[#c9bea9] text-[#6b5c4b] hover:bg-white/50'
              }`}
            >
              전체 {selectedTotal}문항 정주행
            </button>
            <button
              onClick={() => {
                setMode('quick20');
                sound.playPencilMark();
              }}
              className={`p-2.5 rounded-lg font-medium border text-center transition-all cursor-pointer ${
                mode === 'quick20'
                  ? 'bg-white border-[#2b2722] text-[#1f1b17] shadow-2xs font-bold'
                  : 'bg-transparent border-[#c9bea9] text-[#6b5c4b] hover:bg-white/50'
              }`}
            >
              핵심 20제 빠른 연습
            </button>
          </div>
        </div>

        {/* Real Exam vs Instant Grading Mode Selector */}
        <div className="mb-6 p-4 bg-[#ede6d5]/70 rounded-xl border border-[#d6cab7]">
          <div className="flex items-center justify-between mb-2.5">
            <label className="font-serif-kr font-bold text-xs text-[#3d3328] flex items-center gap-1.5">
              <span>🎯 채점 방식 선택</span>
            </label>
            <span className="text-[10px] font-mono-custom text-[#786957]">
              {gradingMode === 'exam' ? '실제 시험 환경' : '학습 집중 모드'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                setGradingMode('instant');
                sound.playPencilMark();
              }}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer relative ${
                gradingMode === 'instant'
                  ? 'bg-white border-[#c2410c] text-[#1f1b17] shadow-2xs font-bold ring-1 ring-[#c2410c]/30'
                  : 'bg-transparent border-[#c9bea9] text-[#6b5c4b] hover:bg-white/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-serif-kr">즉시 채점 (연습용)</span>
                {gradingMode === 'instant' && <CheckCircle2 className="w-3.5 h-3.5 text-[#c2410c]" />}
              </div>
              <p className="text-[11px] font-normal text-[#786b59] leading-tight">
                문항마다 정답·오답 및 수기 해설을 바로 확인
              </p>
            </button>

            <button
              onClick={() => {
                setGradingMode('exam');
                sound.playPencilMark();
              }}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer relative ${
                gradingMode === 'exam'
                  ? 'bg-white border-[#241f19] text-[#1f1b17] shadow-2xs font-bold ring-1 ring-[#241f19]/30'
                  : 'bg-transparent border-[#c9bea9] text-[#6b5c4b] hover:bg-white/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-serif-kr">진짜 시험 모드 (종합 채점)</span>
                {gradingMode === 'exam' && <CheckCircle2 className="w-3.5 h-3.5 text-[#241f19]" />}
              </div>
              <p className="text-[11px] font-normal text-[#786b59] leading-tight">
                정답 노출 없이 마킹 후 제출 시 한번에 채점
              </p>
            </button>
          </div>
        </div>

        {/* Action Start Button */}
        <button
          id="startQuizBtn"
          onClick={handleStart}
          className="w-full py-4 px-6 bg-[#1f1b17] hover:bg-[#38332c] active:scale-[0.99] text-[#faf8f2] font-serif-kr font-bold text-base rounded-xl border border-[#110e0b] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#fbbf24]" />
          <span>{selectedLabel} 시험지 펼치기</span>
        </button>

        {/* Saved wrong notes shortcut if exists */}
        {savedWrongCount > 0 && (
          <div className="mt-4 pt-3 border-t border-[#d8ccb8] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#b91c1c] font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>오답노트 보관함에 {savedWrongCount}문항이 있습니다.</span>
            </div>
            <button
              onClick={() => onStartQuiz(selectedYear, 'wrongOnly', gradingMode)}
              className="text-xs font-bold font-hand text-[#b91c1c] hover:underline bg-[#fbe7e7] px-2.5 py-1 rounded border border-[#f5c2c2] cursor-pointer"
            >
              오답만 풀기 →
            </button>
          </div>
        )}

        {/* Notebook footer quote */}
        <div className="mt-5 text-center text-[11px] font-hand text-[#827463]">
          ✨ 진짜 시험지 위에서 펜으로 채점하듯 정답을 체크해 보세요!
        </div>
      </div>

      {/* Reset Confirmation Dialog Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-[#faf7ef] paper-texture-ivory rounded-2xl paper-shadow-vintage border-2 border-[#d0c5b4] p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#fde8e8] border border-[#f5c2c2] flex items-center justify-center mx-auto mb-3.5 text-[#b91c1c]">
              <RotateCcw className="w-6 h-6 animate-spin-slow" />
            </div>
            
            <h3 className="font-serif-kr font-bold text-lg text-[#2a221b] mb-1.5">
              문제 풀이 데이터 초기화
            </h3>
            
            <p className="font-serif-kr text-xs text-[#6e5f4e] leading-relaxed mb-5">
              지금까지 풀었던 회차별 응시 기록(빨간펜 체크), 정답·오답 기록 및 오답노트 보관함 데이터를 모두 지우고 처음 상태로 되돌립니다. 계속하시겠습니까?
            </p>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#cfc4b1] bg-[#ece5d5] hover:bg-[#e0d6c2] text-[#4d4032] font-serif-kr text-xs font-semibold cursor-pointer transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#991b1b] bg-[#b91c1c] hover:bg-[#991b1b] text-white font-serif-kr text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                기록 초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
