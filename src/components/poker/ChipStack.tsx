
import React from 'react';

interface ChipStackProps {
  amount: number;
  size?: 'small' | 'large';
  maxStacks?: number;
  divisor?: number;
}

export const ChipStack: React.FC<ChipStackProps> = ({ 
  amount,
  size = 'large',
  maxStacks = 5,
  divisor = 100
}) => {
  const chipSize = size === 'small' ? 'w-10 h-10' : 'w-16 h-16';
  const stacks = Math.min(maxStacks, Math.ceil(amount / divisor));

  return (
    <div className="chip-stack-3d relative">
      {[...Array(stacks)].map((_, i) => (
        <div
          key={i}
          className={`absolute ${chipSize}`}
          style={{
            transform: `translateY(${i * -2}px) translateZ(${i * 1}px)`,
            zIndex: i
          }}
        >
          <div className="w-full h-full rounded-full border-[3px] border-[#7E69AB] bg-[#9b87f5] shadow-[0_0_10px_rgba(155,135,245,0.3),inset_0_2px_3px_rgba(255,255,255,0.3),inset_0_-2px_3px_rgba(0,0,0,0.3)] transform-gpu transition-all duration-200" />
        </div>
      ))}
      <div className={`relative ${chipSize} rounded-full border-[3px] border-[#7E69AB] bg-[#9b87f5] shadow-[0_0_10px_rgba(155,135,245,0.3),inset_0_2px_3px_rgba(255,255,255,0.3),inset_0_-2px_3px_rgba(0,0,0,0.3)] flex items-center justify-center text-xs font-bold text-white/90 transform-gpu rotateX(55deg)`}>
        ${amount}
      </div>
    </div>
  );
};
