import { useEffect, useState } from 'react';
import EventStream from './EventStream';

type Player = {
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
  personality: {
    style: 'aggressive' | 'conservative' | 'balanced' | 'unpredictable';
    riskTolerance: number;
    bluffFrequency: number;
    name: string;
    description: string;
  };
};

type GameState = {
  players: Player[];
  pot: number;
  communityCards: string[];
  currentBet: number;
  currentPlayer: number;
  phase: string;
  lastAction?: string;
  handNumber: number;
  winners?: Player[];
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

  // Get top 3 players sorted by chips
  const getTopPlayers = () => {
    if (!gameState) return [];
    return [...gameState.players]
      .filter(p => !p.eliminated)
      .sort((a, b) => b.chips - a.chips)
      .slice(0, 3)
      .map((p, i) => ({ ...p, position: i + 1 }));
  };

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

  const topPlayers = getTopPlayers();

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-900 text-gray-100">
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* Fixed-height header section */}
        <div className="flex-none space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-cyan-400">Phase: {gameState.phase}</h2>
              <p className="text-lg text-green-400">Pot: ${gameState.pot}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-purple-400">Hand #{gameState.handNumber}</p>
              <p className="text-sm text-cyan-400">Current Bet: ${gameState.currentBet}</p>
            </div>
          </div>

          {/* Top Players Section */}
          <div className="bg-gray-800 border border-cyan-900 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-cyan-400 mb-2">Top Players</h3>
            <div className="grid grid-cols-3 gap-2">
              {topPlayers.map(player => (
                <div 
                  key={player.id}
                  className="flex items-center gap-2 p-2 bg-gray-800 border border-gray-700 rounded"
                >
                  <div className={`
                    w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold
                    ${player.position === 1 ? 'bg-yellow-900 text-yellow-300 border border-yellow-500' :
                      player.position === 2 ? 'bg-gray-700 text-gray-300 border border-gray-500' :
                      'bg-orange-900 text-orange-300 border border-orange-500'}
                  `}>
                    #{player.position}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium text-cyan-300">
                      {player.name}
                      <span className={`ml-2 text-xs ${
                        player.personality.style === 'aggressive' ? 'text-red-400' :
                        player.personality.style === 'conservative' ? 'text-blue-400' :
                        player.personality.style === 'balanced' ? 'text-green-400' :
                        'text-purple-400'
                      }`}>
                        {player.personality.style}
                      </span>
                    </div>
                    <div className="text-xs text-green-400">${player.chips}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {gameState.lastAction && (
            <p className="text-sm text-cyan-300 bg-gray-800 border border-cyan-900 p-2 rounded">
              Last Action: {gameState.lastAction}
            </p>
          )}
        </div>

        {/* Scrollable game content */}
        <div className="flex-1 overflow-y-auto mt-4 min-h-0">
          {gameState.winners ? (
            <div className="bg-gray-800 border border-green-900 p-4 rounded-lg">
              <h2 className="text-2xl font-bold text-green-400 mb-4">Tournament Results</h2>
              <div className="grid gap-4">
                {gameState.winners.map((winner) => (
                  <div key={winner.id} className="flex items-center gap-4 p-4 bg-gray-800 border border-cyan-900 rounded-lg">
                    <div className="text-2xl font-bold text-cyan-400">#{winner.rank}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-cyan-300">{winner.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          winner.personality.style === 'aggressive' ? 'bg-red-900 text-red-300' :
                          winner.personality.style === 'conservative' ? 'bg-blue-900 text-blue-300' :
                          winner.personality.style === 'balanced' ? 'bg-green-900 text-green-300' :
                          'bg-purple-900 text-purple-300'
                        }`}>
                          {winner.personality.style}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{winner.personality.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                        <p className="text-green-400">Final Chips: ${winner.chips}</p>
                        <p className="text-purple-400">Hands Won: {winner.handsWon}</p>
                        <p className="text-cyan-400">Hands Played: {winner.handsPlayed}</p>
                        <p className="text-blue-400">Total Bets: ${winner.totalBets}</p>
                        <p className="text-green-400">Biggest Pot: ${winner.biggestPot}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Community Cards</h3>
                <div className="flex gap-2 min-h-[60px] bg-gray-800 border border-green-900 p-3 rounded-lg">
                  {gameState.communityCards.map((card, i) => (
                    <div key={i} className="p-2 bg-gray-900 border border-cyan-900 rounded shadow-lg text-white">
                      {card}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {gameState.players.map((player, i) => (
                  <div
                    key={player.id}
                    className={`p-4 bg-gray-800 rounded-lg border ${
                      i === gameState.currentPlayer ? 'border-cyan-500 shadow-lg shadow-cyan-900/50' : 'border-gray-700'
                    } ${player.folded ? 'opacity-50' : ''} ${
                      player.eliminated ? 'bg-red-900/20' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-cyan-300">{player.name}</h4>
                        <span className={`text-xs ${
                          player.personality.style === 'aggressive' ? 'text-red-400' :
                          player.personality.style === 'conservative' ? 'text-blue-400' :
                          player.personality.style === 'balanced' ? 'text-green-400' :
                          'text-purple-400'
                        }`}>
                          {player.personality.description}
                        </span>
                      </div>
                      {player.eliminated ? (
                        <span className="text-xs bg-red-900 text-red-300 border border-red-700 px-2 py-1 rounded">
                          #{player.rank}
                        </span>
                      ) : (
                        <span className="text-xs bg-cyan-900 text-cyan-300 border border-cyan-700 px-2 py-1 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 text-sm mt-2">
                      <p className="text-green-400">Chips: ${player.chips}</p>
                      <p className="text-purple-400">Hands Won: {player.handsWon}</p>
                      <p className="text-cyan-400">Hands Played: {player.handsPlayed}</p>
                      <p className="text-blue-400">Total Bets: ${player.totalBets}</p>
                    </div>
                    {player.bet > 0 && (
                      <div className="mt-2 text-sm bg-yellow-900/30 border border-yellow-900 p-2 rounded text-yellow-300">
                        Current Bet: ${player.bet}
                      </div>
                    )}
                    {!player.eliminated && (
                      <div className="flex gap-2 mt-2 min-h-[48px]">
                        {player.hand.map((card, j) => (
                          <div key={j} className="p-2 bg-gray-900 border border-cyan-900 rounded shadow-lg text-white">
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
      </div>
      
      {/* Event Stream Side Panel */}
      <div className="w-80 border-l border-cyan-900 p-4 bg-gray-900">
        <EventStream gameState={gameState} className="h-full" />
      </div>
    </div>
  );
} 