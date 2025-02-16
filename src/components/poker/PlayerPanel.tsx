
import React from 'react';
import { type Player } from '../../types/poker';
import { ChipStack } from './ChipStack';
import { PlayerCards } from './PlayerCards';
import { ArrowRight } from 'lucide-react';

interface PlayerPanelProps {
  player: Player;
  index: number;
  isCurrentPlayer: boolean;
  dealerPos: { x: number; y: number };
  isDealing: boolean;
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({
  player,
  index,
  isCurrentPlayer,
  dealerPos,
  isDealing
}) => {
  // Adjusted angles for oval table layout
  const positions = [
    { angle: -60, radius: { x: 50, y: 40 } },  // Player 1 (top left)
    { angle: -20, radius: { x: 50, y: 40 } },  // Player 2 (top right)
    { angle: 20, radius: { x: 50, y: 40 } },   // Player 3 (right)
    { angle: 180, radius: { x: 0, y: 0 } },    // Dealer (bottom)
    { angle: 160, radius: { x: 50, y: 40 } },  // Player 5 (bottom left)
    { angle: -160, radius: { x: 50, y: 40 } }, // Player 6 (left)
  ];

  const pos = positions[index];
  const angleRad = (pos.angle) * (Math.PI / 180);
  const left = 50 + pos.radius.x * Math.cos(angleRad);
  const top = 50 + pos.radius.y * Math.sin(angleRad);

  return (
    <div
      className={`player-panel absolute w-[220px] min-h-[160px] -translate-x-1/2 -translate-y-1/2 ${
        isCurrentPlayer ? 'ring-2 ring-primary' : ''
      } ${player.id === 'dealer' ? 'dealer-seat' : ''}`}
      style={{
        left: `${left}%`,
        top: `${top}%`,
      }}
    >
      {isCurrentPlayer && (
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-primary animate-pulse">
          <ArrowRight size={24} />
        </div>
      )}
      <div className="flex justify-between items-start mb-2 min-h-[80px]">
        <div className="flex flex-col h-full">
          <h3 className="font-semibold text-lg mb-1">{player.name}</h3>
          <span
            className={`text-sm mb-2 ${
              player.personality.style === 'aggressive'
                ? 'text-red-400'
                : player.personality.style === 'conservative'
                ? 'text-blue-400'
                : player.personality.style === 'balanced'
                ? 'text-green-400'
                : 'text-purple-400'
            }`}
          >
            {player.personality.description}
          </span>
          {player.id !== 'dealer' && (
            <div className="text-lg font-bold text-primary bg-primary/10 px-2 py-1 rounded-md inline-block">
              ${player.chips}
            </div>
          )}
        </div>
        {player.id !== 'dealer' && (
          <ChipStack amount={player.chips} size="small" maxStacks={3} divisor={500} />
        )}
      </div>

      {!player.eliminated && player.id !== 'dealer' && (
        <PlayerCards 
          hand={player.hand}
          folded={player.folded}
          isDealing={isDealing}
          index={index}
          dealerPos={dealerPos}
        />
      )}

      {player.bet > 0 && (
        <div className="mt-4 flex flex-col items-center">
          <ChipStack amount={player.bet} size="small" />
          <div className="mt-1 text-sm font-semibold text-primary-foreground/80">
            Current bet
          </div>
        </div>
      )}
    </div>
  );
};
