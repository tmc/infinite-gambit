
import React from 'react';

interface CommunityCardsProps {
  cards: string[];
  isDealing: boolean;
  dealerPos: { x: number; y: number };
}

export const CommunityCards: React.FC<CommunityCardsProps> = ({
  cards,
  isDealing,
  dealerPos
}) => {
  const getCardColor = (card: string) => {
    return card.includes('♥') || card.includes('♦') ? 'red' : 'black';
  };

  return (
    <div className="flex gap-2 justify-center mb-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`poker-card ${getCardColor(card)} ${
            isDealing ? 'deal-animation' : ''
          }`}
          style={{ 
            animationDelay: `${(index) * 0.15}s`,
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
