import { useEffect, useState } from 'react';
import EventStream from './EventStream';
import Image from 'next/image';
import { getAgentLogo, type AgentType } from '../lib/agents/Agent';

type PlayerStyle = 'aggressive' | 'conservative' | 'balanced' | 'unpredictable';

type PlayerPersonality = {
  style: PlayerStyle;
  riskTolerance: number;
  bluffFrequency: number;
  name: string;
  description: string;
  agentType: AgentType;
};

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
  personality: PlayerPersonality;
  prevChips?: number;
  position?: number;
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

type GameSettings = {
  playerCount: number;
  startingChips: number;
  blinds: {
    small: number;
    big: number;
  };
};

type TournamentProps = {
  settings?: GameSettings;
};

const styleColors = {
  aggressive: {
    text: 'text-red-400',
    bg: 'bg-red-900',
    border: 'border-red-700',
    textHighlight: 'text-red-300'
  },
  conservative: {
    text: 'text-blue-400',
    bg: 'bg-blue-900',
    border: 'border-blue-700',
    textHighlight: 'text-blue-300'
  },
  balanced: {
    text: 'text-green-400',
    bg: 'bg-green-900',
    border: 'border-green-700',
    textHighlight: 'text-green-300'
  },
  unpredictable: {
    text: 'text-purple-400',
    bg: 'bg-purple-900',
    border: 'border-purple-700',
    textHighlight: 'text-purple-300'
  }
} as const;

const positionColors = {
  1: 'bg-yellow-900 text-yellow-300 border-yellow-500',
  2: 'bg-gray-700 text-gray-300 border-gray-500',
  3: 'bg-orange-900 text-orange-300 border-orange-500'
} as const;

export default function Tournament({ settings }: TournamentProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);

  const getTopPlayers = () => {
    if (!gameState) return [];
    return [...gameState.players]
      .filter(p => !p.eliminated)
      .sort((a, b) => b.chips - a.chips)
      .slice(0, 3)
      .map((p, i) => ({ ...p, position: i + 1 }));
  };

  const getStyleColors = (style: PlayerStyle) => styleColors[style];
  const getPositionColors = (position: number) => positionColors[position as keyof typeof positionColors];

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
              setGameState(prev => ({
                ...parsed.data,
                players: parsed.data.players.map((player: Player) => ({
                  ...player,
                  prevChips: prev?.players.find(p => p.id === player.id)?.chips ?? player.chips,
                }))
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error in tournament:', error);
      }
    };

    startGame();
  }, [settings]);

  if (!gameState) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-gray-100">
        <div className="text-xl">Loading tournament...</div>
      </div>
    );
  }

  const topPlayers = getTopPlayers();

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-900 text-gray-100">
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* Fixed-height header section */}
        <div className="flex-none h-48 space-y-4">
          <div className="flex justify-between items-start h-16">
            <div className="min-w-[150px]">
              <h2 className="text-xl font-bold text-cyan-400">Phase: {gameState.phase}</h2>
              <p className="text-lg text-green-400">Pot: ${gameState.pot}</p>
            </div>
            <div className="text-right min-w-[150px]">
              <p className="text-lg font-semibold text-purple-400">Hand #{gameState.handNumber}</p>
              <p className="text-sm text-cyan-400">Current Bet: ${gameState.currentBet}</p>
            </div>
          </div>

          {/* Top Players Section */}
          <div className="bg-gray-800 border border-cyan-900 rounded-lg p-3 h-24">
            <h3 className="text-sm font-semibold text-cyan-400 mb-2">Top Players</h3>
            <div className="grid grid-cols-3 gap-2">
              {topPlayers.map(player => (
                <div 
                  key={player.id}
                  className="flex items-center gap-2 p-2 bg-gray-800 border border-gray-700 rounded"
                >
                  <div className={`
                    w-6 h-6 flex-none flex items-center justify-center rounded-full text-sm font-bold border
                    ${player.position ? getPositionColors(player.position) : ''}
                  `}>
                    #{player.position}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium text-cyan-300">
                      {player.name}
                      <span className={`ml-2 text-xs ${getStyleColors(player.personality.style).text}`}>
                        {player.personality.style}
                      </span>
                    </div>
                    <div className="text-xs text-green-400">${player.chips}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Last Action */}
          <div className="h-8">
            {gameState.lastAction && (
              <p className="text-sm text-cyan-300 bg-gray-800 border border-cyan-900 p-2 rounded">
                {gameState.lastAction}
              </p>
            )}
          </div>
        </div>

        {/* Game Content */}
        <div className="flex-1 overflow-y-auto mt-4 min-h-0">
          {gameState.winners ? (
            <div className="bg-gray-800 border border-green-900 p-4 rounded-lg">
              <h2 className="text-2xl font-bold text-green-400 mb-4">Tournament Results</h2>
              <div className="grid gap-4">
                {gameState.winners.map((winner) => (
                  <div key={winner.id} className="flex items-center gap-4 p-4 bg-gray-800 border border-cyan-900 rounded-lg">
                    <div className="text-2xl font-bold text-cyan-400 w-12 flex-none">#{winner.rank}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-cyan-300 truncate">{winner.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded flex-none ${getStyleColors(winner.personality.style).bg} ${getStyleColors(winner.personality.style).textHighlight}`}>
                          {winner.personality.style}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">{winner.personality.description}</p>
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
              {/* Community Cards */}
              <div className="h-24 mb-4">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Community Cards</h3>
                <div className="flex gap-2 h-16 bg-gray-800 border border-green-900 p-3 rounded-lg items-center">
                  {gameState.communityCards.map((card, i) => (
                    <div key={i} className="w-12 h-16 flex items-center justify-center bg-gray-900 border border-cyan-900 rounded shadow-lg text-white">
                      {card}
                    </div>
                  ))}
                </div>
              </div>

              {/* Player Grid */}
              <div className="grid grid-cols-2 gap-4">
                {gameState.players.map((player, i) => (
                  <div
                    key={player.id}
                    className={`h-48 p-4 bg-gray-800 rounded-lg border transition-all duration-300 ${
                      i === gameState.currentPlayer ? 'border-cyan-500 shadow-lg shadow-cyan-900/50' : 'border-gray-700'
                    } ${player.folded ? 'opacity-50' : ''} ${
                      player.eliminated ? 'bg-red-900/20' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start h-8">
                      <div className="min-w-0 flex items-center gap-2">
                        <Image
                          src={getAgentLogo(player.personality.agentType)}
                          alt={`${player.personality.agentType} logo`}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                        <div>
                          <h4 className="font-semibold text-cyan-300 truncate">{player.name}</h4>
                          <span className={`text-xs truncate block ${getStyleColors(player.personality.style).text}`}>
                            {player.personality.description}
                          </span>
                        </div>
                      </div>
                      {player.eliminated ? (
                        <span className="text-xs bg-red-900 text-red-300 border border-red-700 px-2 py-1 rounded flex-none">
                          #{player.rank}
                        </span>
                      ) : (
                        <span className="text-xs bg-cyan-900 text-cyan-300 border border-cyan-700 px-2 py-1 rounded flex-none">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 text-sm mt-2 h-12">
                      <p className="text-green-400">Chips: ${player.chips}</p>
                      <p className="text-purple-400">Hands Won: {player.handsWon}</p>
                      <p className="text-cyan-400">Hands Played: {player.handsPlayed}</p>
                      <p className="text-blue-400">Total Bets: ${player.totalBets}</p>
                    </div>
                    {player.bet > 0 && (
                      <div className="mt-2 text-sm bg-yellow-900/30 border border-yellow-900 p-2 rounded text-yellow-300 h-8">
                        Current Bet: ${player.bet}
                      </div>
                    )}
                    {!player.eliminated && (
                      <div className="flex gap-2 mt-2 h-16 items-center">
                        {player.hand.map((card, j) => (
                          <div key={j} className="w-12 h-16 flex items-center justify-center bg-gray-900 border border-cyan-900 rounded shadow-lg text-white">
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
      <div className="w-80 flex-none border-l border-cyan-900 p-4 bg-gray-900 overflow-hidden">
        <EventStream gameState={gameState} className="h-full" />
      </div>
    </div>
  );
} 