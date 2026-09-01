import React from 'react';
import { Award, CheckCircle, Sparkles } from 'lucide-react';

interface StampProps {
  type: 'praise' | 'perfect' | 'passed' | 'review' | 'correct';
  className?: string;
}

export const StampBadge: React.FC<StampProps> = ({ type, className = '' }) => {
  if (type === 'praise' || type === 'correct') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 bg-[#fff5f5] border-2 border-[#dc2626] rounded-md text-[#dc2626] shadow-sm transform -rotate-3 animate-stamp ${className}`}>
        <Award className="w-4 h-4 text-[#dc2626]" />
        <span className="font-hand font-bold text-base tracking-wide">
          참 잘했어요! 💮
        </span>
      </div>
    );
  }

  if (type === 'perfect') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#fefce8] border-2 border-[#ca8a04] rounded-lg text-[#ca8a04] shadow-md transform -rotate-6 animate-stamp ${className}`}>
        <Sparkles className="w-5 h-5 text-[#eab308]" />
        <span className="font-serif-kr font-bold text-lg tracking-wider">
          100점 만점! 🌟
        </span>
      </div>
    );
  }

  if (type === 'passed') {
    return (
      <div className={`inline-block px-5 py-2 rubber-stamp-red transform -rotate-8 animate-stamp ${className}`}>
        <div className="text-center">
          <div className="text-xl font-bold tracking-widest leading-none">PASSED</div>
          <div className="text-[11px] font-medium tracking-normal mt-0.5">합격 인정 · 60% 이상</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-block px-4 py-2 border-2 border-[#b91c1c] text-[#b91c1c] rounded font-bold transform rotate-6 animate-stamp ${className}`}>
      <div className="text-center text-sm">
        <div>오답 집중 복습</div>
        <div className="text-[10px] font-normal mt-0.5">핵심 오답노트 정리</div>
      </div>
    </div>
  );
};
