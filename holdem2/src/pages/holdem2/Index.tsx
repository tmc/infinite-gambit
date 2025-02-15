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
      id: 'dealer',
      name: 'Dealer',
      chips: 0,
      hand: [],
      bet: 0,
      folded: false,
      eliminated: false,
      personality: {
        style: 'balanced',
        description: 'House Dealer'
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
  dealerPosition: 3, // Fixed dealer position
  isDealing: false
};

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [chipAnimations, setChipAnimations] = useState<{
    fromId: string;
    amount: number;
    timestamp: number;
  }[]>([]);

  const getCardColor = (card: string) => {
    return card.includes('♥') || card.includes('♦') ? 'red' : 'black';
  };

  const getDealerPosition = () => {
    const dealerAngle = (3 * (360 / 6) - 90) * (Math.PI / 180); // Position 4 (index 3)
    return {
      x: 50 + 42 * Math.cos(dealerAngle),
      y: 50 + 42 * Math.sin(dealerAngle)
    };
  };

  const startNewRound = () => {
    setGameState(prev => ({
      ...prev,
      isDealing: true,
      dealerPosition: (prev.dealerPosition + 1) % prev.players.length
    }));

    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        isDealing: false
      }));
    }, 2000);
  };

  const dealerPos = getDealerPosition();

  const placeBet = (playerId: string, amount: number) => {
    setGameState(prev => {
      const updatedPlayers = prev.players.map(player => {
        if (player.id === playerId) {
          return {
            ...player,
            chips: player.chips - amount,
            bet: player.bet + amount
          };
        }
        return player;
      });

      return {
        ...prev,
        players: updatedPlayers,
        pot: prev.pot + amount,
        currentBet: Math.max(prev.currentBet, amount)
      };
    });

    // Add chip animation
    setChipAnimations(prev => [
      ...prev,
      { fromId: playerId, amount, timestamp: Date.now() }
    ]);

    // Clean up animation after it completes
    setTimeout(() => {
      setChipAnimations(prev => 
        prev.filter(anim => anim.timestamp !== Date.now())
      );
    }, 1000);
  };

  useEffect(() => {
    if (gameState.isDealing) {
      const timer = setTimeout(() => {
        placeBet('1', 50);
        setTimeout(() => placeBet('2', 100), 1000);
        setTimeout(() => placeBet('3', 150), 2000);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [gameState.isDealing]);

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
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
              <div className="flex gap-2">
                {gameState.communityCards.map((card, index) => (
                  <div
                    key={index}
                    className={`poker-card ${getCardColor(card)} ${
                      gameState.isDealing ? 'deal-animation' : ''
                    }`}
                    style={{ 
                      animationDelay: gameState.isDealing ? `${(gameState.players.length * 2 + index) * 0.15}s` : '0s',
                      '--deal-from-x': `${dealerPos.x}%`,
                      '--deal-from-y': `${dealerPos.y}%`,
                    } as React.CSSProperties}
                  >
                    {card}
                  </div>
                ))}
              </div>
              {gameState.pot > 0 && (
                <div className="flex flex-col items-center">
                  <div className="chip-stack relative mt-4">
                    {[...Array(Math.min(5, Math.ceil(gameState.pot / 100)))].map((_, i) => (
                      <div
                        key={i}
                        className="chip absolute bg-primary/20 border-2 border-primary text-primary w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold shadow-md"
                        style={{
                          transform: `translateY(${i * -4}px)`,
                          zIndex: i
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-primary mt-8">${gameState.pot}</span>
                </div>
              )}
            </div>
          </div>

          <div 
            className="absolute w-8 h-8 bg-white rounded-full border-2 border-primary flex items-center justify-center text-sm font-bold text-primary transition-all duration-300 -translate-x-1/2 -translate-y-1/2 shadow-lg z-10"
            style={{
              left: `${50 + 35 * Math.cos((gameState.dealerPosition * (360 / 6) - 90) * (Math.PI / 180))}%`,
              top: `${50 + 35 * Math.sin((gameState.dealerPosition * (360 / 6) - 90) * (Math.PI / 180))}%`,
            }}
          >
            D
          </div>

          {gameState.players.map((player, index) => {
            const angle = (index * (360 / 6) - 90) * (Math.PI / 180);
            const radius = 42;
            const left = 50 + radius * Math.cos(angle);
            const top = 50 + radius * Math.sin(angle);

            return (
              <div
                key={player.id}
                className={`player-panel absolute w-[200px] -translate-x-1/2 -translate-y-1/2 ${
                  index === gameState.currentPlayer ? 'active' : ''
                } ${player.id === 'dealer' ? 'dealer-seat' : ''}`}
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
                  {player.id !== 'dealer' && (
                    <div className="chip-stack relative">
                      {[...Array(Math.min(3, Math.ceil(player.chips / 500)))].map((_, i) => (
                        <div
                          key={i}
                          className="chip absolute bg-secondary border-2 border-primary/50 text-primary w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md"
                          style={{
                            transform: `translateY(${i * -2}px)`,
                            zIndex: i
                          }}
                        />
                      ))}
                      <div className="chip relative bg-secondary border-2 border-primary/50 text-primary w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                        ${player.chips}
                      </div>
                    </div>
                  )}
                </div>

                {!player.eliminated && player.id !== 'dealer' && (
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
                          '--deal-from-x': `${dealerPos.x}%`,
                          '--deal-from-y': `${dealerPos.y}%`,
                        } as React.CSSProperties}
                      >
                        {card}
                      </div>
                    ))}
                  </div>
                )}

                {player.bet > 0 && (
                  <div className="mt-4 flex flex-col items-center">
                    <div className="chip-stack relative">
                      {[...Array(Math.min(3, Math.ceil(player.bet / 50)))].map((_, i) => (
                        <div
                          key={i}
                          className="chip absolute bg-primary/20 border-2 border-primary text-primary w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md"
                          style={{
                            transform: `translateY(${i * -2}px)`,
                            zIndex: i
                          }}
                        />
                      ))}
                      <div className="chip relative bg-primary/20 border-2 border-primary text-primary w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md">
                        ${player.bet}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {chipAnimations.map(({fromId, amount, timestamp}) => {
            const sourcePlayer = gameState.players.find(p => p.id === fromId);
            if (!sourcePlayer) return null;

            const sourceIndex = gameState.players.indexOf(sourcePlayer);
            const sourceAngle = (sourceIndex * (360 / 6) - 90) * (Math.PI / 180);
            const sourceX = 50 + 42 * Math.cos(sourceAngle);
            const sourceY = 50 + 42 * Math.sin(sourceAngle);

            return (
              <div
                key={timestamp}
                className="chip absolute bg-primary/20 border-2 border-primary text-primary w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md z-50 chip-animation"
                style={{
                  '--start-x': `${sourceX}%`,
                  '--start-y': `${sourceY}%`,
                  '--end-x': '50%',
                  '--end-y': '50%',
                } as React.CSSProperties}
              >
                ${amount}
              </div>
            );
          })}
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

      <style>
        {`
          .deal-animation {
            animation: dealCard 0.5s ease-out forwards;
          }
          
          @keyframes dealCard {
            0% {
              transform: translate(
                calc(var(--deal-from-x) - 50%),
                calc(var(--deal-from-y) - 50%)
              ) scale(0.75);
              opacity: 0;
            }
            100% {
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
          }
          
          .dealer-seat {
            background: rgba(255, 255, 255, 0.1);
            padding: 1rem;
            border-radius: 0.5rem;
            backdrop-filter: blur(4px);
          }

          .chip-animation {
            animation: moveChip 1s ease-out forwards;
          }

          @keyframes moveChip {
            0% {
              transform: translate(
                calc(var(--start-x) - 50%),
                calc(var(--start-y) - 50%)
              );
              opacity: 1;
            }
            100% {
              transform: translate(
                calc(var(--end-x) - 50%),
                calc(var(--end-y) - 50%)
              );
              opacity: 0;
            }
          }

          .chip-stack {
            transform-style: preserve-3d;
            perspective: 1000px;
          }

          .chip {
            transition: transform 0.3s ease;
          }

          .chip:hover {
            transform: translateZ(10px) !important;
          }
        `}
      </style>
    </div>
  );
};

export default Index;
