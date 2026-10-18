import React from 'react';

interface RedPenCircleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'badge';
  variant?: 'single' | 'double-loop' | 'flourish';
}

export const RedPenCircle: React.FC<RedPenCircleProps> = ({
  className = '',
  size = 'md',
  variant = 'double-loop'
}) => {
  // Hand-drawn realistic pen loops with organic curves and overlapping stroke
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    badge: 'w-28 h-12'
  };

  if (variant === 'badge') {
    return (
      <svg
        viewBox="0 0 160 70"
        className={`absolute inset-0 pointer-events-none ${className}`}
        style={{ overflow: 'visible' }}
      >
        {/* Organic hand-drawn oval circle around entire option or badge */}
        <path
          d="M 18,34 C 18,16 55,10 88,10 C 130,10 152,22 152,36 C 152,52 120,62 80,62 C 34,62 12,50 14,32 C 16,14 62,8 96,8"
          fill="none"
          stroke="#ff3b30"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-draw-circle"
          style={{
            filter: 'drop-shadow(0 0 1.2px rgba(217, 36, 36, 0.45))',
            opacity: 0.95
          }}
        />
      </svg>
    );
  }

  return (
    <div className={`absolute -inset-1.5 pointer-events-none flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full transform -rotate-6`}
        style={{ overflow: 'visible' }}
      >
        {/* Double-loop realistic red ballpoint/felt-tip pen stroke */}
        <path
          d="M 50,14 C 74,12 91,27 89,52 C 87,76 68,90 47,89 C 23,88 11,68 13,44 C 15,20 37,8 60,9 C 84,10 93,31 92,54 C 91,72 75,86 52,87"
          fill="none"
          stroke="#ff3b30"
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-draw-circle"
          style={{
            filter: 'drop-shadow(0 0 1px rgba(220, 38, 38, 0.5))',
            opacity: 0.95
          }}
        />
      </svg>
    </div>
  );
};

export const RedPenSlash: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 pointer-events-none flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full" style={{ overflow: 'visible' }}>
        {/* Quick red pen diagonal stroke / cross-out slash */}
        <path
          d="M 18,18 Q 45,52 82,82"
          fill="none"
          stroke="#ff3b30"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="animate-draw-slash"
          style={{ opacity: 0.9 }}
        />
        <path
          d="M 80,20 Q 52,50 20,80"
          fill="none"
          stroke="#ff3b30"
          strokeWidth="2.8"
          strokeLinecap="round"
          className="animate-draw-slash"
          style={{ animationDelay: '0.1s', opacity: 0.8 }}
        />
      </svg>
    </div>
  );
};

export const RedPenCheckMark: React.FC<{ 
  className?: string; 
  size?: 'xs' | 'sm' | 'md' | 'lg';
  animate?: boolean;
}> = ({ 
  className = '',
  size = 'md',
  animate = true
}) => {
  const sizeMap = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <svg 
      viewBox="0 0 48 48" 
      className={`${sizeMap[size]} pointer-events-none inline-block flex-shrink-0 ${className}`}
      style={{ overflow: 'visible' }}
    >
      {/* Authentic natural hand-drawn red ballpoint pen checkmark */}
      <path
        d="M 6,24 C 11,28 16,35 21,41 C 25,32 34,18 42,7"
        fill="none"
        stroke="#ff3b30"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animate ? 'animate-draw-check' : ''}
        style={{
          filter: 'drop-shadow(0 0 1px rgba(220, 38, 38, 0.45))',
          opacity: 0.95
        }}
      />
    </svg>
  );
};
