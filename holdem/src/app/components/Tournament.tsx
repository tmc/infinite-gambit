import { useEffect, useState } from 'react';

type GameState = {
  players: {
    id: string;
    name: string;
    chips: number;
    hand: string[];
    bet: number;
    folded: boolean;
  }[];
  pot: number;
  communityCards: string[];
  currentBet: number;
  currentPlayer: number;
  phase: string;
  lastAction?: string;
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
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Phase: {gameState.phase}</h2>
        <p className="text-lg">Pot: ${gameState.pot}</p>
        {gameState.lastAction && (
          <p className="text-sm text-gray-600">Last Action: {gameState.lastAction}</p>
        )}
      </div>

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
            } ${player.folded ? 'opacity-50' : ''}`}
          >
            <h4 className="font-semibold">{player.name}</h4>
            <p>Chips: ${player.chips}</p>
            {player.bet > 0 && <p className="text-sm">Bet: ${player.bet}</p>}
            <div className="flex gap-2 mt-2">
              {player.hand.map((card, j) => (
                <div key={j} className="p-2 border rounded">
                  {card}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 