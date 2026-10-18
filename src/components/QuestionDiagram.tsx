import React from 'react';

interface QuestionDiagramProps {
  type: string;
}

export const QuestionDiagram: React.FC<QuestionDiagramProps> = ({ type }) => {
  if (type === 'car-body-q42') {
    return (
      <div className="my-4 p-3 sm:p-4 bg-(--a-card) rounded-xl border-2 border-(--a-label-3) max-w-md mx-auto shadow-xs select-none">
        <div className="relative w-full aspect-[16/10] bg-(--a-card) rounded-lg border border-(--a-label-3) p-3 overflow-hidden flex items-center justify-center">
          {/* Top-left [전방] label */}
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 border border-(--a-label-3) bg-(--a-card) text-(--a-label) text-xs font-serif-kr font-bold shadow-2xs">
            전방
          </div>

          {/* Bottom-right [후방] label */}
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 border border-(--a-label-3) bg-(--a-card) text-(--a-label) text-xs font-serif-kr font-bold shadow-2xs">
            후방
          </div>

          {/* Car Body Monocoque Frame SVG */}
          <svg
            viewBox="0 0 340 180"
            className="w-full h-full max-h-[170px]"
            fill="none"
            stroke="#1f1b17"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Front apron / frame rails */}
            <path d="M 50 102 L 68 98 L 74 108 L 56 112 Z" fill="#f8f7f2" strokeWidth="1.8" />
            <path d="M 50 102 L 62 94 L 80 94 L 74 108" strokeWidth="1.5" />
            
            {/* Front Wheel arch */}
            <path d="M 68 112 Q 80 96 98 108 L 102 118" strokeWidth="2" />
            <path d="M 72 110 Q 82 100 96 110" strokeWidth="1.2" strokeDasharray="2,2" />

            {/* Front Windshield frame & A-Pillar */}
            <path d="M 96 90 L 138 82 L 188 84" strokeWidth="2.2" />
            <path d="M 96 90 L 130 94 L 140 126" strokeWidth="1.8" />
            <path d="M 138 82 L 146 118" strokeWidth="1.8" />

            {/* Roof Line */}
            <path d="M 138 82 Q 180 76 220 86" strokeWidth="2.2" />
            <path d="M 136 84 Q 180 79 218 88" strokeWidth="1" />

            {/* Center B-Pillar & Cabin Floor */}
            <path d="M 176 80 L 174 128" strokeWidth="2" />
            <path d="M 180 82 L 180 124" strokeWidth="1.2" />
            <path d="M 102 118 L 142 126 L 176 128 L 204 128" strokeWidth="2.2" />
            <path d="M 112 120 L 142 114 L 174 116 L 200 118" strokeWidth="1.2" strokeDasharray="3,3" />

            {/* Rear C-Pillar & Rear Window Frame */}
            <path d="M 220 86 L 254 98 L 278 104" strokeWidth="2.2" />
            <path d="M 204 88 L 230 102 L 250 110" strokeWidth="1.5" />
            <path d="M 184 104 Q 224 100 260 108" strokeWidth="1.2" />

            {/* Trunk Deck & Rear Body Structure */}
            <path d="M 254 98 Q 284 100 298 108 L 296 118 L 274 126 L 236 136 L 210 134" strokeWidth="2" fill="#fcfbf9" />
            <path d="M 278 104 Q 294 106 296 114" strokeWidth="1.5" />
            <path d="M 250 110 Q 272 112 284 118" strokeWidth="1.2" />

            {/* Rear Quarter Panel / Rear Fender Exterior Contour */}
            <path d="M 204 128 Q 200 118 206 112 Q 218 106 232 118 L 236 136" strokeWidth="2.2" />
            <path d="M 204 128 L 236 136 L 268 132 L 290 122" strokeWidth="2.2" />
            
            {/* Trunk opening shape */}
            <ellipse cx="248" cy="106" rx="26" ry="8" strokeWidth="1.2" transform="rotate(-6 248 106)" />

            {/* Pointer Arrow pointing specifically to Rear Fender (A) */}
            <g className="cursor-pointer">
              {/* Arrow Line */}
              <line x1="195" y1="158" x2="216" y2="128" stroke="#ff3b30" strokeWidth="2.5" strokeLinecap="round" />
              {/* Arrow Head */}
              <polygon points="216,124 210,132 220,130" fill="#ff3b30" />
              
              {/* Circle A Label Indicator */}
              <circle cx="188" cy="165" r="12" fill="#ff3b30" stroke="#b91c1c" strokeWidth="1.5" />
              <text
                x="188"
                y="169"
                textAnchor="middle"
                fill="white"
                fontSize="12"
                fontWeight="900"
                fontFamily="sans-serif"
                dominantBaseline="middle"
              >
                A
              </text>
            </g>
          </svg>
        </div>

        <div className="mt-2 text-center text-xs text-(--a-label) font-serif-kr">
          [사고 자동차 수리 이력 부위 모노코크 보디도]
        </div>
      </div>
    );
  }

  return null;
};
