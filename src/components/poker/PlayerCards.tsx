
import React from 'react';

interface PlayerCardsProps {
  hand: string[];
  folded: boolean;
  isDealing: boolean;
  index: number;
  dealerPos: { x: number; y: number };
}

export const PlayerCards: React.FC<PlayerCardsProps> = ({
  hand,
  folded,
  isDealing,
  index,
  dealerPos
}) => {
  const getCardColor = (card: string) => {
    return card.includes('♥') || card.includes('♦') ? 'red' : 'black';
  };

  return (
    <div className="flex gap-2 justify-center">
      {hand.map((card, cardIndex) => (
        <div
          key={cardIndex}
          className={`poker-card scale-90 ${getCardColor(card)} ${
            folded ? 'opacity-50' : ''
          } ${isDealing ? 'deal-animation' : ''}`}
          style={{
            animationDelay: isDealing 
              ? `${((index * 2) + cardIndex) * 0.15}s` 
              : '0s',
            '--deal-from-x': `${dealerPos.x}%`,
            '--deal-from-y': `${dealerPos.y}%`,
          } as React.CSSProperties}
        >
          {card}
        </div>
      ))}
    </div>
  );
};
