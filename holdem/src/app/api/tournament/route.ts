import { NextRequest } from 'next/server';

// Simple card representation
type Card = {
  rank: string;
  suit: string;
};

// Player representation
type Player = {
  id: string;
  name: string;
  chips: number;
  hand: Card[];
};

// Game state
type GameState = {
  players: Player[];
  pot: number;
  communityCards: Card[];
  currentBet: number;
  currentPlayer: number;
  phase: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
};

type GameSettings = {
  playerCount: number;
  startingChips: number;
  blinds: {
    small: number;
    big: number;
  };
};

const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const suits = ['♠', '♣', '♥', '♦'];

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ rank, suit });
    }
  }
  return shuffle(deck);
}

function shuffle(array: any[]): any[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function POST(req: NextRequest) {
  const settings: GameSettings = await req.json();
  
  // Initialize stream
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Initialize game state
        const deck = createDeck();
        const players: Player[] = Array.from({ length: settings.playerCount }, (_, i) => ({
          id: `player${i + 1}`,
          name: `Player ${i + 1}`,
          chips: settings.startingChips,
          hand: [deck.pop()!, deck.pop()!],
        }));

        const gameState: GameState = {
          players,
          pot: 0,
          communityCards: [],
          currentBet: settings.blinds.big,
          currentPlayer: 0,
          phase: 'preflop',
        };

        // Send initial game state
        controller.enqueue(JSON.stringify({
          type: 'gameState',
          data: gameState,
        }) + '\n');

        // Simulate game progression
        const phases = ['preflop', 'flop', 'turn', 'river', 'showdown'];
        for (const phase of phases) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          gameState.phase = phase as any;
          if (phase === 'flop') {
            gameState.communityCards = [deck.pop()!, deck.pop()!, deck.pop()!];
          } else if (phase === 'turn' || phase === 'river') {
            gameState.communityCards.push(deck.pop()!);
          }

          controller.enqueue(JSON.stringify({
            type: 'gameState',
            data: gameState,
          }) + '\n');
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  // Return a standard Response with proper streaming headers
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
} 