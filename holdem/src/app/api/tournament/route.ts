import { NextRequest } from 'next/server';
import { type PlayerPersonality } from '@/app/lib/PlayerAgent';
import { PokerTable } from '@/app/lib/PokerTable';

// Game state
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
    personality: PlayerPersonality;
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

type GameSettings = {
  playerCount: number;
  startingChips: number;
  blinds: {
    small: number;
    big: number;
  };
};

export async function POST(req: NextRequest) {
  try {
    const settings: GameSettings = await req.json();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const table = new PokerTable(
            settings.playerCount,
            settings.startingChips,
            settings.blinds.small,
            settings.blinds.big
          );

          // Tournament loop
          while (table.players.some(p => !p.eliminated)) {
            // Start new hand
            table.dealCards();
            
            // Post blinds
            const smallBlindPlayer = table.players[1];
            const bigBlindPlayer = table.players[2];
            
            smallBlindPlayer.chips -= settings.blinds.small;
            smallBlindPlayer.bet = settings.blinds.small;
            smallBlindPlayer.totalBets += settings.blinds.small;
            table.pot += settings.blinds.small;
            
            bigBlindPlayer.chips -= settings.blinds.big;
            bigBlindPlayer.bet = settings.blinds.big;
            bigBlindPlayer.totalBets += settings.blinds.big;
            table.pot += settings.blinds.big;
            table.currentBet = settings.blinds.big;
            
            // Start with first player (UTG)
            table.currentPlayerIndex = 3;
            
            // Send initial hand state
            const initialState = {
              type: 'gameState',
              data: {
                players: table.players.map(p => ({
                  id: p.id,
                  name: p.name,
                  chips: p.chips,
                  hand: p.hand,
                  bet: p.bet,
                  folded: p.folded,
                  handsWon: p.handsWon,
                  handsPlayed: p.handsPlayed,
                  totalBets: p.totalBets,
                  biggestPot: p.biggestPot,
                  eliminated: p.eliminated,
                  rank: p.rank,
                  personality: p.personality
                })),
                pot: table.pot,
                communityCards: table.communityCards,
                currentBet: table.currentBet,
                currentPlayer: table.currentPlayerIndex,
                phase: table.phase,
                lastAction: table.lastAction,
                handNumber: table.handNumber,
              },
            };
            
            controller.enqueue(encoder.encode(JSON.stringify(initialState) + '\n'));
            
            // Play hand until completion
            while (!table.isHandComplete()) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              table.handlePlayerTurn();
              
              // Send updated state
              const updatedState = {
                type: 'gameState',
                data: {
                  players: table.players.map(p => ({
                    id: p.id,
                    name: p.name,
                    chips: p.chips,
                    hand: p.hand,
                    bet: p.bet,
                    folded: p.folded,
                    handsWon: p.handsWon,
                    handsPlayed: p.handsPlayed,
                    totalBets: p.totalBets,
                    biggestPot: p.biggestPot,
                    eliminated: p.eliminated,
                    rank: p.rank,
                    personality: p.personality
                  })),
                  pot: table.pot,
                  communityCards: table.communityCards,
                  currentBet: table.currentBet,
                  currentPlayer: table.currentPlayerIndex,
                  phase: table.phase,
                  lastAction: table.lastAction,
                  handNumber: table.handNumber,
                },
              };
              
              controller.enqueue(encoder.encode(JSON.stringify(updatedState) + '\n'));
            }
            
            // Rotate positions for next hand
            table.players.push(table.players.shift()!);
            table.handNumber++;
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

          // Send final tournament results
          const finalState = {
            type: 'gameState',
            data: {
              players: table.players.map(p => ({
                id: p.id,
                name: p.name,
                chips: p.chips,
                hand: p.hand,
                bet: p.bet,
                folded: p.folded,
                handsWon: p.handsWon,
                handsPlayed: p.handsPlayed,
                totalBets: p.totalBets,
                biggestPot: p.biggestPot,
                eliminated: p.eliminated,
                rank: p.rank,
                personality: p.personality
              })),
              pot: table.pot,
              communityCards: table.communityCards,
              currentBet: table.currentBet,
              currentPlayer: table.currentPlayerIndex,
              phase: table.phase,
              lastAction: table.lastAction,
              handNumber: table.handNumber,
              winners: table.players
                .filter(p => !p.eliminated || p.rank! <= 3)
                .sort((a, b) => (a.rank || 999) - (b.rank || 999))
                .slice(0, 3)
                .map(p => ({
                  id: p.id,
                  name: p.name,
                  chips: p.chips,
                  handsWon: p.handsWon,
                  handsPlayed: p.handsPlayed,
                  totalBets: p.totalBets,
                  biggestPot: p.biggestPot,
                  rank: p.rank!,
                })),
            },
          };
          
          controller.enqueue(encoder.encode(JSON.stringify(finalState) + '\n'));
          controller.close();
        } catch (error) {
          console.error('Tournament error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Transfer-Encoding': 'chunked'
      },
    });
  } catch (error) {
    console.error('Tournament endpoint error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 