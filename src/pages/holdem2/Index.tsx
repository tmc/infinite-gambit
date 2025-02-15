
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
  dealerPosition: number;
  isDealing: boolean;
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
  phase: 'flop',
  dealerPosition: 0,
  isDealing: false
};

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);

  const getCardColor = (card: string) => {
    return card.includes('♥') || card.includes('♦') ? 'red' : 'black';
  };

  const startNewRound = () => {
    setGameState(prev => ({
      ...prev,
      isDealing: true,
      dealerPosition: (prev.dealerPosition + 1) % prev.players.length
    }));

    // Reset dealing animation after cards are dealt
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        isDealing: false
      }));
    }, 2000); // Adjust timing based on animation duration
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <header className="mb-8">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-primary">Poker</span> Tournament
          </h1>
          <div className="flex gap-4 items-center">
            <button 
              onClick={startNewRound}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Deal New Hand
            </button>
            <div className="chip-stack">
              <span className="text-muted-foreground">Current Pot:</span>
              <div className="chip bg-primary/20 border-primary text-primary">
                ${gameState.pot}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto relative">
        <div className="aspect-[16/9] max-w-[1200px] mx-auto relative mb-8">
          <div className="absolute inset-[10%] rounded-[100%] bg-[#234E23] border-8 border-[#403E43] shadow-2xl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2">
              {gameState.communityCards.map((card, index) => (
                <div
                  key={index}
                  className={`poker-card ${getCardColor(card)} ${
                    gameState.isDealing ? 'deal-animation' : ''
                  }`}
                  style={{ 
                    animationDelay: gameState.isDealing ? `${(gameState.players.length * 2 + index) * 0.15}s` : '0s'
                  }}
                >
                  {card}
                </div>
              ))}
            </div>
          </div>

          {gameState.players.map((player, index) => {
            const angle = (index * (360 / 6) - 90) * (Math.PI / 180);
            const radius = 42;
            const left = 50 + radius * Math.cos(angle);
            const top = 50 + radius * Math.sin(angle);

            // Calculate dealer button position
            const dealerButtonAngle = ((gameState.dealerPosition * (360 / 6)) - 90) * (Math.PI / 180);
            const dealerButtonRadius = 38; // Slightly inside the player circle
            const dealerButtonLeft = 50 + dealerButtonRadius * Math.cos(dealerButtonAngle);
            const dealerButtonTop = 50 + dealerButtonRadius * Math.sin(dealerButtonAngle);

            return (
              <div
                key={player.id}
                className={`player-panel absolute w-[200px] -translate-x-1/2 -translate-y-1/2 ${
                  index === gameState.currentPlayer ? 'active' : ''
                }`}
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                }}
              >
                <div className="flex justify-between items-start mb-2">
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
                  <div className="flex gap-1 justify-center">
                    {player.hand.map((card, cardIndex) => (
                      <div
                        key={cardIndex}
                        className={`poker-card scale-75 ${getCardColor(card)} ${
                          player.folded ? 'opacity-50' : ''
                        } ${gameState.isDealing ? 'deal-animation' : ''}`}
                        style={{
                          animationDelay: gameState.isDealing 
                            ? `${((index * 2) + cardIndex) * 0.15}s` 
                            : '0s',
                          transformOrigin: 'center center',
                        }}
                      >
                        {card}
                      </div>
                    ))}
                  </div>
                )}

                {player.bet > 0 && (
                  <div className="mt-2 text-center">
                    <span className="text-sm text-muted-foreground">
                      Current bet:
                    </span>
                    <span className="ml-2 text-primary">${player.bet}</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Dealer Button */}
          <div 
            className="absolute w-8 h-8 bg-white rounded-full border-2 border-primary flex items-center justify-center text-sm font-bold text-primary transition-all duration-300 -translate-x-1/2 -translate-y-1/2 shadow-lg"
            style={{
              left: `${50 + 38 * Math.cos((gameState.dealerPosition * (360 / 6) - 90) * (Math.PI / 180))}%`,
              top: `${50 + 38 * Math.sin((gameState.dealerPosition * (360 / 6) - 90) * (Math.PI / 180))}%`,
            }}
          >
            D
          </div>
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
