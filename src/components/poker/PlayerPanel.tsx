
import React from 'react';
import { type Player } from '../../types/poker';
import { ChipStack } from './ChipStack';
import { PlayerCards } from './PlayerCards';

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
  const angle = (index * (360 / 6) - 90) * (Math.PI / 180);
  const radius = 42;
  const left = 50 + radius * Math.cos(angle);
  const top = 50 + radius * Math.sin(angle);

  return (
    <div
      className={`player-panel absolute w-[200px] min-h-[140px] -translate-x-1/2 -translate-y-1/2 ${
        isCurrentPlayer ? 'active ring-2 ring-primary animate-pulse' : ''
      } ${player.id === 'dealer' ? 'dealer-seat' : ''}`}
      style={{
        left: `${left}%`,
        top: `${top}%`,
      }}
    >
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
