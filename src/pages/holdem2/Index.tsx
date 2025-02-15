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
  stepIndex: number;
};

type ChipAnimation = {
  fromId: string;
  toId?: string;
  amount: number;
  timestamp: number;
  type: 'bet' | 'collect';
};

const INITIAL_GAME_STATE: GameState = {
  players: [
    {
      id: '1',
      name: 'Player 1',
      chips: 1000,
      hand: [],
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
      hand: [],
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
      hand: [],
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
      hand: [],
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
      hand: [],
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
  communityCards: [],
  currentBet: 0,
  currentPlayer: 0,
  phase: 'preflop',
  dealerPosition: 3,
  isDealing: false,
  stepIndex: -1
};

const SUITS = ['♠', '♥', '♦', '♣'] as const;
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'] as const;

const SMALL_BLIND = 10;
const BIG_BLIND = 20;

const createDeck = () => {
  const deck: string[] = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      deck.push(rank + suit);
    });
  });
  return deck;
};

const shuffleDeck = (deck: string[]) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [deck, setDeck] = useState<string[]>([]);
  const [chipAnimations, setChipAnimations] = useState<ChipAnimation[]>([]);
  const [shuffledDeck, setShuffledDeck] = useState<string[]>([]);

  const getCardColor = (card: string | undefined) => {
    if (!card) return 'black'; // Default color if no card
    return card.includes('♥') || card.includes('♦') ? 'red' : 'black';
  };

  const getDealerPosition = () => {
    const dealerAngle = (3 * (360 / 6) - 90) * (Math.PI / 180); // Position 4 (index 3)
    return {
      x: 50 + 42 * Math.cos(dealerAngle),
      y: 50 + 42 * Math.sin(dealerAngle)
    };
  };

  const getPlayerIndex = (offset: number) => {
    let pos = (gameState.dealerPosition + 1 + offset) % gameState.players.length;
    
    if (pos >= 3) {
      pos += 1;
    }
    
    if (pos >= gameState.players.length) {
      pos = pos % gameState.players.length;
    }
    
    return pos;
  };

  const executeStep = (stepIndex: number) => {
    if (!shuffledDeck.length) {
      console.log('No shuffled deck available');
      return;
    }

    console.log('Executing step:', stepIndex, 'Current dealer position:', gameState.dealerPosition);

    switch (stepIndex) {
      case 0: // Initialize new hand and post blinds
        const smallBlindIndex = getPlayerIndex(0);
        const bigBlindIndex = getPlayerIndex(1);
        
        setGameState(prev => {
          const updatedPlayers = prev.players.map((player, index) => {
            if (index === smallBlindIndex) {
              return {
                ...player,
                chips: player.chips - SMALL_BLIND,
                bet: SMALL_BLIND
              };
            }
            if (index === bigBlindIndex) {
              return {
                ...player,
                chips: player.chips - BIG_BLIND,
                bet: BIG_BLIND
              };
            }
            return player;
          });

          return {
            ...prev,
            players: updatedPlayers,
            pot: SMALL_BLIND + BIG_BLIND,
            currentBet: BIG_BLIND,
            phase: 'preflop',
            lastAction: `Blinds posted: ${SMALL_BLIND}/${BIG_BLIND}`,
            stepIndex: 0
          };
        });

        // Add chip animations for blinds
        setChipAnimations(prev => [
          ...prev,
          { 
            fromId: prev.players[smallBlindIndex].id, 
            amount: SMALL_BLIND, 
            timestamp: Date.now(), 
            type: 'bet' 
          },
          { 
            fromId: prev.players[bigBlindIndex].id, 
            amount: BIG_BLIND, 
            timestamp: Date.now() + 100, 
            type: 'bet' 
          }
        ]);
        break;

      case 1: // Deal first card to player 1
        const firstPlayerIndex = getPlayerIndex(0);
        console.log('Dealing first card to player index:', firstPlayerIndex); // Debug log
        
        if (firstPlayerIndex >= 0 && firstPlayerIndex < gameState.players.length && firstPlayerIndex !== 3) {
          setGameState(prev => ({
            ...prev,
            players: prev.players.map((player, index) => ({
              ...player,
              hand: index === firstPlayerIndex ? [shuffledDeck[0]] : player.hand
            })),
            lastAction: `Dealing first card to ${prev.players[firstPlayerIndex].name}`,
            stepIndex: 1
          }));
        } else {
          console.error('Invalid player index:', firstPlayerIndex);
        }
        break;

      case 2: // Deal first card to player 2
        setGameState(prev => ({
          ...prev,
          players: prev.players.map((player, index) => ({
            ...player,
            hand: index === getPlayerIndex(1) ? [shuffledDeck[1]] : player.hand
          })),
          lastAction: `Dealing first card to ${prev.players[getPlayerIndex(1)].name}`,
          stepIndex: 2
        }));
        break;

      // ... Continue for each player's first card

      case 3: // Deal first card to player 3
        setGameState(prev => ({
          ...prev,
          players: prev.players.map((player, index) => ({
            ...player,
            hand: index === getPlayerIndex(2) ? [shuffledDeck[2]] : player.hand
          })),
          lastAction: `Dealing first card to ${prev.players[getPlayerIndex(2)].name}`,
          stepIndex: 3
        }));
        break;

      case 4: // Deal first card to player 5
        setGameState(prev => ({
          ...prev,
          players: prev.players.map((player, index) => ({
            ...player,
            hand: index === getPlayerIndex(3) ? [shuffledDeck[3]] : player.hand
          })),
          lastAction: `Dealing first card to ${prev.players[getPlayerIndex(3)].name}`,
          stepIndex: 4
        }));
        break;

      case 5: // Deal first card to player 6
        setGameState(prev => ({
          ...prev,
          players: prev.players.map((player, index) => ({
            ...player,
            hand: index === getPlayerIndex(4) ? [shuffledDeck[4]] : player.hand
          })),
          lastAction: `Dealing first card to ${prev.players[getPlayerIndex(4)].name}`,
          stepIndex: 5
        }));
        break;

      case 6: // Start second round of dealing
        setGameState(prev => ({
          ...prev,
          lastAction: 'Starting second round of cards',
          stepIndex: 6
        }));
        break;

      case 7: // Deal second card to player 1
        setGameState(prev => ({
          ...prev,
          players: prev.players.map((player, index) => ({
            ...player,
            hand: index === getPlayerIndex(0) ? 
              [...player.hand, shuffledDeck[5]] : player.hand
          })),
          lastAction: `Dealing second card to ${prev.players[getPlayerIndex(0)].name}`,
          stepIndex: 7
        }));
        break;

      // ... Continue for each player's second card

      case 8: // Deal second card to player 2
        setGameState(prev => ({
          ...prev,
          players: prev.players.map((player, index) => ({
            ...player,
            hand: index === getPlayerIndex(1) ? 
              [...player.hand, shuffledDeck[6]] : player.hand
          })),
          lastAction: `Dealing second card to ${prev.players[getPlayerIndex(1)].name}`,
          stepIndex: 8
        }));
        break;

      case 9: // Deal second card to player 3
        setGameState(prev => ({
          ...prev,
          players: prev.players.map((player, index) => ({
            ...player,
            hand: index === getPlayerIndex(2) ? 
              [...player.hand, shuffledDeck[7]] : player.hand
          })),
          lastAction: `Dealing second card to ${prev.players[getPlayerIndex(2)].name}`,
          stepIndex: 9
        }));
        break;

      case 10: // Deal second card to player 5
        setGameState(prev => ({
          ...prev,
          players: prev.players.map((player, index) => ({
            ...player,
            hand: index === getPlayerIndex(3) ? 
              [...player.hand, shuffledDeck[8]] : player.hand
          })),
          lastAction: `Dealing second card to ${prev.players[getPlayerIndex(3)].name}`,
          stepIndex: 10
        }));
        break;

      case 11: // Deal second card to player 6
        setGameState(prev => ({
          ...prev,
          players: prev.players.map((player, index) => ({
            ...player,
            hand: index === getPlayerIndex(4) ? 
              [...player.hand, shuffledDeck[9]] : player.hand
          })),
          lastAction: `Dealing second card to ${prev.players[getPlayerIndex(4)].name}`,
          stepIndex: 11
        }));
        break;

      case 12: // Deal flop
        setGameState(prev => ({
          ...prev,
          phase: 'flop',
          communityCards: [shuffledDeck[10], shuffledDeck[11], shuffledDeck[12]],
          lastAction: 'Dealing flop',
          stepIndex: 12
        }));
        break;

      case 13: // Deal turn
        setGameState(prev => ({
          ...prev,
          phase: 'turn',
          communityCards: [...prev.communityCards, shuffledDeck[13]],
          lastAction: 'Dealing turn',
          stepIndex: 13
        }));
        break;

      case 14: // Deal river
        setGameState(prev => ({
          ...prev,
          phase: 'river',
          communityCards: [...prev.communityCards, shuffledDeck[14]],
          lastAction: 'Dealing river',
          stepIndex: 14,
          isDealing: false
        }));
        break;

      default:
        break;
    }
  };

  const nextStep = () => {
    if (gameState.stepIndex === -1) {
      // First step - initialize the deck
      const newDeck = shuffleDeck(createDeck());
      console.log('New deck created:', newDeck); // Debug log
      setShuffledDeck(newDeck);
      setGameState(prev => ({
        ...INITIAL_GAME_STATE,
        dealerPosition: (prev.dealerPosition + 1) % prev.players.length,
        isDealing: true,
        stepIndex: 0
      }));
    } else {
      executeStep(gameState.stepIndex + 1);
    }
  };

  const startNewRound = () => {
    const newDeck = shuffleDeck(createDeck());
    console.log('Starting new round with dealer at position:', gameState.dealerPosition); // Debug log
    setShuffledDeck(newDeck);
    setDeck(newDeck);

    // Reset to initial state
    setGameState(prev => ({
      ...INITIAL_GAME_STATE,
      dealerPosition: (prev.dealerPosition + 1) % gameState.players.length,
      isDealing: true,
      phase: 'preflop',
      lastAction: 'New hand dealt',
      stepIndex: -1
    }));
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
      { fromId: playerId, amount, timestamp: Date.now(), type: 'bet' }
    ]);

    // Clean up animation after it completes
    setTimeout(() => {
      setChipAnimations(prev => 
        prev.filter(anim => anim.timestamp !== Date.now())
      );
    }, 1000);
  };

  const collectWinnings = (playerId: string, amount: number) => {
    setGameState(prev => {
      const updatedPlayers = prev.players.map(player => {
        if (player.id === playerId) {
          return {
            ...player,
            chips: player.chips + amount,
            bet: 0
          };
        }
        return { ...player, bet: 0 };
      });

      return {
        ...prev,
        players: updatedPlayers,
        pot: 0,
        currentBet: 0,
        lastAction: `${updatedPlayers.find(p => p.id === playerId)?.name} wins ${amount}`
      };
    });

    // Add collect animation
    setChipAnimations(prev => [
      ...prev,
      { fromId: 'pot', toId: playerId, amount, timestamp: Date.now(), type: 'collect' }
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
        setTimeout(() => collectWinnings('2', 300), 5000);
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
              disabled={gameState.isDealing}
            >
              Deal New Hand
            </button>
            <button 
              onClick={nextStep}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
              disabled={!gameState.isDealing || gameState.stepIndex >= 14}
            >
              Next Step
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
            <div 
              className="absolute w-12 h-12 bg-white rounded-full border-4 border-[#9b87f5] flex items-center justify-center text-xl font-bold text-[#9b87f5] transition-all duration-300 -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${50 + 30 * Math.cos((gameState.dealerPosition * (360 / 6) - 90) * (Math.PI / 180))}%`,
                top: `${50 + 30 * Math.sin((gameState.dealerPosition * (360 / 6) - 90) * (Math.PI / 180))}%`,
              }}
            >
              D
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
              <div className="flex gap-2 mb-8">
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
                  <div className="chip-stack-3d relative">
                    {[...Array(Math.min(5, Math.ceil(gameState.pot / 100)))].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-16 h-16"
                        style={{
                          transform: `translateY(${i * -2}px) translateZ(${i * 1}px)`,
                          zIndex: i
                        }}
                      >
                        <div className="w-full h-full rounded-full border-[3px] border-[#7E69AB] bg-[#9b87f5] shadow-[0_0_10px_rgba(155,135,245,0.3),inset_0_2px_3px_rgba(255,255,255,0.3),inset_0_-2px_3px_rgba(0,0,0,0.3)] transform-gpu transition-all duration-200" />
                      </div>
                    ))}
                    <div className="relative w-16 h-16 rounded-full border-[3px] border-[#7E69AB] bg-[#9b87f5] shadow-[0_0_10px_rgba(155,135,245,0.3),inset_0_2px_3px_rgba(255,255,255,0.3),inset_0_-2px_3px_rgba(0,0,0,0.3)] flex items-center justify-center text-sm font-bold text-white/90">
                      ${gameState.pot}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {gameState.players.map((player, index) => {
            const angle = (index * (360 / 6) - 90) * (Math.PI / 180);
            const radius = 42;
            const left = 50 + radius * Math.cos(angle);
            const top = 50 + radius * Math.sin(angle);

            return (
              <div
                key={player.id}
                className={`player-panel absolute w-[200px] min-h-[140px] -translate-x-1/2 -translate-y-1/2 ${
                  index === gameState.currentPlayer ? 'active ring-2 ring-primary animate-pulse' : ''
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
                    <div className="chip-stack-3d relative shrink-0">
                      {[...Array(Math.min(3, Math.ceil(player.chips / 500)))].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-10 h-10"
                          style={{
                            transform: `translateY(${i * -2}px) translateZ(${i * 1}px)`,
                            zIndex: i
                          }}
                        >
                          <div className="w-full h-full rounded-full border-[3px] border-[#7E69AB] bg-[#9b87f5] shadow-[0_0_10px_rgba(155,135,245,0.3),inset_0_2px_3px_rgba(255,255,255,0.3),inset_0_-2px_3px_rgba(0,0,0,0.3)] transform-gpu transition-all duration-200" />
                        </div>
                      ))}
                      <div className="relative w-10 h-10 rounded-full border-[3px] border-[#7E69AB] bg-[#9b87f5] shadow-[0_0_10px_rgba(155,135,245,0.3),inset_0_2px_3px_rgba(255,255,255,0.3),inset_0_-2px_3px_rgba(0,0,0,0.3)] flex items-center justify-center text-xs font-bold text-white/90 transform-gpu rotateX(55deg)">
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
                    <div className="chip-stack-3d relative">
                      <div className="relative w-10 h-10 rounded-full border-[3px] border-[#7E69AB] bg-[#9b87f5] shadow-[0_0_10px_rgba(155,135,245,0.3),inset_0_2px_3px_rgba(255,255,255,0.3),inset_0_-2px_3px_rgba(0,0,0,0.3)] flex items-center justify-center text-xs font-bold text-white/90 transform-gpu rotateX(55deg)">
                        ${player.bet}
                      </div>
                    </div>
                    <div className="mt-1 text-sm font-semibold text-primary-foreground/80">
                      Current bet
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {chipAnimations.map(({fromId, toId, amount, timestamp, type}) => {
            const sourcePlayer = type === 'bet' ? 
              gameState.players.find(p => p.id === fromId) :
              { id: 'pot' };
            const targetPlayer = type === 'collect' ? 
              gameState.players.find(p => p.id === toId) :
              { id: 'pot' };
            
            if (!sourcePlayer) return null;

            const sourceIndex = type === 'bet' ? 
              gameState.players.indexOf(sourcePlayer as Player) : -1;
            const targetIndex = type === 'collect' && targetPlayer ? 
              gameState.players.indexOf(targetPlayer as Player) : -1;

            const sourceAngle = type === 'bet' ? 
              (sourceIndex * (360 / 6) - 90) * (Math.PI / 180) : 0;
            const targetAngle = type === 'collect' ? 
              (targetIndex * (360 / 6) - 90) * (Math.PI / 180) : 0;

            const sourceX = type === 'bet' ? 
              50 + 42 * Math.cos(sourceAngle) :
              50;
            const sourceY = type === 'bet' ? 
              50 + 42 * Math.sin(sourceAngle) :
              50;

            const targetX = type === 'collect' ? 
              50 + 42 * Math.cos(targetAngle) :
              50;
            const targetY = type === 'collect' ? 
              50 + 42 * Math.sin(targetAngle) :
              50;

            return (
              <div
                key={timestamp}
                className="chip absolute bg-primary/20 border-2 border-primary text-primary w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md z-50 chip-animation"
                style={{
                  '--start-x': `${sourceX}%`,
                  '--start-y': `${sourceY}%`,
                  '--end-x': `${targetX}%`,
                  '--end-y': `${targetY}%`,
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
          <div className="flex gap-4 items-center">
            <div className="text-sm text-muted-foreground">
              Phase: <span className="text-primary font-semibold uppercase">{gameState.phase}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Pot: <span className="text-primary font-semibold">${gameState.pot}</span>
            </div>
            {gameState.currentBet > 0 && (
              <div className="text-sm text-muted-foreground">
                Current bet: <span className="text-primary font-semibold">${gameState.currentBet}</span>
              </div>
            )}
          </div>
          {gameState.lastAction && (
            <div className="text-sm text-muted-foreground">
              Last action: <span className="text-primary font-semibold">{gameState.lastAction}</span>
            </div>
          )}
        </div>
      </footer>

      <style>
        {`
          .deal-animation {
            animation: dealCard 0.3s ease-out forwards;
          }
          
          @keyframes dealCard {
            0% {
              transform: translate(
                calc(var(--deal-from-x) - 50%),
                calc(var(--deal-from-y) - 50%)
              ) scale(0.75) rotate(180deg);
              opacity: 0;
            }
            100% {
              transform: translate(0, 0) scale(1) rotate(0deg);
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

          .chip-stack-3d {
            transform-style: preserve-3d;
            perspective: 1000px;
          }

          .chip-stack-3d > * {
            transition: all 0.2s ease;
          }

          .chip-stack-3d:hover > * {
            transform: translateY(0) rotateX(0) !important;
          }
        `}
      </style>
    </div>
  );
};

export default Index;
