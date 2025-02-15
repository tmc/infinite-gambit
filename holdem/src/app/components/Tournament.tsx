import { useEffect, useState } from 'react';
import EventStream from './EventStream';

type GameState = {
  players: {
    id: string;
    name: string;
    chips: number;
    hand: string[];
    bet: number;
    folded: boolean;
    handsWon: number;
    handsPlayed: number;
    totalBets: number;
    biggestPot: number;
    eliminated: boolean;
    rank?: number;
  }[];
  pot: number;
  communityCards: string[];
  currentBet: number;
  currentPlayer: number;
  phase: string;
  lastAction?: string;
  handNumber: number;
  winners?: {
    id: string;
    name: string;
    chips: number;
    handsWon: number;
    handsPlayed: number;
    totalBets: number;
    biggestPot: number;
    rank: number;
  }[];
};

type TournamentProps = {
  settings?: {
    playerCount: number;
    startingChips: number;
    blinds: {
      small: number;
      big: number;
    };
  };
};

export default function Tournament({ settings }: TournamentProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    const startGame = async () => {
      try {
        const response = await fetch('/api/tournament', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerCount: settings?.playerCount || 6,
            startingChips: settings?.startingChips || 1000,
            blinds: settings?.blinds || { small: 10, big: 20 },
          }),
        });

        if (!response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const events = text.split('\n').filter(Boolean);

          for (const event of events) {
            const parsed = JSON.parse(event);
            if (parsed.type === 'gameState') {
              setGameState(parsed.data);
            }
          }
        }
      } catch (error) {
        console.error('Error in tournament:', error);
      }
    };

    startGame();
  }, [settings]);

  if (!gameState) return <div>Loading tournament...</div>;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Phase: {gameState.phase}</h2>
              <p className="text-lg">Pot: ${gameState.pot}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">Hand #{gameState.handNumber}</p>
              <p className="text-sm">Current Bet: ${gameState.currentBet}</p>
            </div>
          </div>
          {gameState.lastAction && (
            <p className="text-sm text-gray-600 mt-2">Last Action: {gameState.lastAction}</p>
          )}
        </div>

        {gameState.winners ? (
          <div className="mb-8 bg-green-50 dark:bg-green-900 p-4 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Tournament Results</h2>
            <div className="grid gap-4">
              {gameState.winners.map((winner, i) => (
                <div key={winner.id} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold">#{winner.rank}</div>
                  <div className="flex-1">
                    <h3 className="font-bold">{winner.name}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p>Final Chips: ${winner.chips}</p>
                      <p>Hands Won: {winner.handsWon}</p>
                      <p>Hands Played: {winner.handsPlayed}</p>
                      <p>Total Bets: ${winner.totalBets}</p>
                      <p>Biggest Pot: ${winner.biggestPot}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Community Cards</h3>
              <div className="flex gap-2">
                {gameState.communityCards.map((card, i) => (
                  <div key={i} className="p-2 border rounded">
                    {card}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {gameState.players.map((player, i) => (
                <div
                  key={player.id}
                  className={`p-4 border rounded ${
                    i === gameState.currentPlayer ? 'border-blue-500' : ''
                  } ${player.folded ? 'opacity-50' : ''} ${
                    player.eliminated ? 'bg-gray-100 dark:bg-gray-800' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold">{player.name}</h4>
                    {player.eliminated && (
                      <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded">
                        #{player.rank}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 text-sm mt-2">
                    <p>Chips: ${player.chips}</p>
                    <p>Hands Won: {player.handsWon}</p>
                    <p>Hands Played: {player.handsPlayed}</p>
                    <p>Total Bets: ${player.totalBets}</p>
                  </div>
                  {player.bet > 0 && (
                    <p className="text-sm mt-2">Current Bet: ${player.bet}</p>
                  )}
                  {!player.eliminated && (
                    <div className="flex gap-2 mt-2">
                      {player.hand.map((card, j) => (
                        <div key={j} className="p-2 border rounded">
                          {card}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Event Stream Side Panel */}
      <div className="w-80 border-l border-gray-200 dark:border-gray-700 p-4">
        <EventStream gameState={gameState} className="h-full" />
      </div>
    </div>
  );
} 