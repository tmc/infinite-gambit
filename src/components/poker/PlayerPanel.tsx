
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
  // Positions going clockwise from dealer (bottom center)
  const positions = [
    { angle: 145, radius: { x: 32, y: 25 } },   // Player 1 (7:30)
    { angle: 180, radius: { x: 32, y: 25 } },   // Player 2 (9:00)
    { angle: -135, radius: { x: 32, y: 25 } },  // Player 3 (10:30)
    { angle: 90, radius: { x: 0, y: 32 } },     // Dealer (6:00)
    { angle: -45, radius: { x: 32, y: 25 } },   // Player 5 (1:30)
    { angle: 0, radius: { x: 32, y: 25 } },     // Player 6 (3:00)
  ];

  const pos = positions[index];
  const angleRad = (pos.angle) * (Math.PI / 180);
  const left = 50 + pos.radius.x * Math.cos(angleRad);
  const top = 50 + pos.radius.y * Math.sin(angleRad);

  return (
    <div
      className={`player-panel absolute w-[180px] min-h-[140px] -translate-x-1/2 -translate-y-1/2 ${
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
      <div className="flex justify-between items-start mb-2 min-h-[60px]">
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
