import { useEffect, useState } from 'react';

type Player = {
  id: string;
  name: string;
  chips: number;
  hand: string[];
  bet: number;
  folded: boolean;
  eliminated: boolean;
  personality: {
    style: 'aggressive' | 'conservative' | 'balanced' | 'unpredictable';
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
};

const INITIAL_GAME_STATE: GameState = {
  players: [
    {
      id: '1',
      name: 'Player 1',
      chips: 1000,
      hand: ['A♠', 'K♠'],
      bet: 0,
      folded: false,
      eliminated: false,
      personality: {
        style: 'aggressive',
        description: 'Bold and ruthless'
      }
    },
    {
      id: '2',
      name: 'Player 2',
      chips: 1200,
      hand: ['Q♥', 'J♥'],
      bet: 0,
      folded: false,
      eliminated: false,
      personality: {
        style: 'conservative',
        description: 'Plays it safe'
      }
    },
    {
      id: '3',
      name: 'Player 3',
      chips: 800,
      hand: ['8♣', '8♦'],
      bet: 0,
      folded: false,
      eliminated: false,
      personality: {
        style: 'balanced',
        description: 'Well-rounded player'
      }
    },
    {
      id: '4',
      name: 'Player 4',
      chips: 1500,
      hand: ['A♦', 'K♦'],
      bet: 0,
      folded: false,
      eliminated: false,
      personality: {
        style: 'unpredictable',
        description: 'Wild and unpredictable'
      }
    },
    {
      id: '5',
      name: 'Player 5',
      chips: 950,
      hand: ['T♠', 'T♣'],
      bet: 0,
      folded: false,
      eliminated: false,
      personality: {
        style: 'aggressive',
        description: 'All-in specialist'
      }
    },
    {
      id: '6',
      name: 'Player 6',
      chips: 1100,
      hand: ['J♠', 'Q♠'],
      bet: 0,
      folded: false,
      eliminated: false,
      personality: {
        style: 'conservative',
        description: 'Methodical player'
      }
    }
  ],
  pot: 0,
  communityCards: ['7♥', '2♣', '5♦'],
  currentBet: 0,
  currentPlayer: 0,
  phase: 'flop'
};

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);

  const getCardColor = (card: string) => {
    return card.includes('♥') || card.includes('♦') ? 'red' : 'black';
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <header className="mb-8">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-primary">Poker</span> Tournament
          </h1>
          <div className="chip-stack">
            <span className="text-muted-foreground">Current Pot:</span>
            <div className="chip bg-primary/20 border-primary text-primary">
              ${gameState.pot}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Community Cards</h2>
          <div className="flex gap-4 justify-center">
            {gameState.communityCards.map((card, index) => (
              <div
                key={index}
                className={`poker-card ${getCardColor(card)} deal-animation`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {card}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gameState.players.map((player, index) => (
            <div
              key={player.id}
              className={`player-panel ${
                index === gameState.currentPlayer ? 'active' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{player.name}</h3>
                  <span
                    className={`text-sm ${
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
                </div>
                <div className="chip bg-secondary border-primary/50 text-primary">
                  ${player.chips}
                </div>
              </div>

              {!player.eliminated && (
                <div className="flex gap-2 justify-center">
                  {player.hand.map((card, cardIndex) => (
                    <div
                      key={cardIndex}
                      className={`poker-card ${getCardColor(card)} ${
                        player.folded ? 'opacity-50' : ''
                      }`}
                    >
                      {card}
                    </div>
                  ))}
                </div>
              )}

              {player.bet > 0 && (
                <div className="mt-4 text-center">
                  <span className="text-sm text-muted-foreground">
                    Current bet:
                  </span>
                  <span className="ml-2 text-primary">${player.bet}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Phase: <span className="text-primary">{gameState.phase}</span>
          </div>
          {gameState.lastAction && (
            <div className="text-sm text-muted-foreground">
              Last action: <span className="text-primary">{gameState.lastAction}</span>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default Index;
