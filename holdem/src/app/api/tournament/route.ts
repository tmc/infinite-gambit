import { NextRequest } from 'next/server';

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

// Simple poker implementation without external dependencies
class PokerPlayer {
  id: string = '';
  chips: number = 0;
  hand: string[] = [];
  bet: number = 0;
  folded: boolean = false;
  handsWon: number = 0;
  handsPlayed: number = 0;
  totalBets: number = 0;
  biggestPot: number = 0;
  eliminated: boolean = false;
  rank?: number;
}

class PokerTable {
  players: PokerPlayer[] = [];
  communityCards: string[] = [];
  pot: number = 0;
  currentBet: number = 0;
  currentPlayerIndex: number = 0;
  phase: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' = 'preflop';
  lastAction?: string;
  deck: string[] = [];
  handNumber: number = 1;
  activePlayers: number = 0;

  constructor(public smallBlind: number, public bigBlind: number) {
    this.initializeDeck();
  }

  private initializeDeck() {
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const suits = ['♠', '♣', '♥', '♦'];
    this.deck = ranks.flatMap(rank => suits.map(suit => `${rank}${suit}`));
    this.shuffle();
  }

  private shuffle() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  addPlayer(chips: number): PokerPlayer {
    const player = new PokerPlayer();
    player.id = `player${this.players.length + 1}`;
    player.chips = chips;
    this.players.push(player);
    this.activePlayers++;
    return player;
  }

  dealCards() {
    // Reset state
    this.communityCards = [];
    this.pot = 0;
    this.currentBet = this.bigBlind;
    this.phase = 'preflop';
    this.initializeDeck();
    
    // Deal hole cards to active players
    for (const player of this.players) {
      if (!player.eliminated) {
        player.hand = [this.deck.pop()!, this.deck.pop()!];
        player.bet = 0;
        player.folded = false;
        player.handsPlayed++;
      }
    }

    // Post blinds
    const sbPlayer = this.findFirstActivePlayer();
    if (!sbPlayer) return;
    
    const bbPlayer = this.findNextActivePlayer(this.players.indexOf(sbPlayer));
    if (!bbPlayer) return;

    // Set small blind
    sbPlayer.bet = this.smallBlind;
    sbPlayer.chips -= this.smallBlind;
    sbPlayer.totalBets += this.smallBlind;
    
    // Set big blind
    bbPlayer.bet = this.bigBlind;
    bbPlayer.chips -= this.bigBlind;
    bbPlayer.totalBets += this.bigBlind;

    // Set starting position
    const firstToAct = this.findNextActivePlayer(this.players.indexOf(bbPlayer));
    this.currentPlayerIndex = firstToAct ? this.players.indexOf(firstToAct) : 0;
  }

  findFirstActivePlayer(): PokerPlayer | null {
    return this.players.find(p => !p.eliminated) || null;
  }

  findNextActivePlayer(fromIndex: number): PokerPlayer | null {
    let index = (fromIndex + 1) % this.players.length;
    const startIndex = index;
    
    do {
      if (!this.players[index].eliminated) {
        return this.players[index];
      }
      index = (index + 1) % this.players.length;
    } while (index !== startIndex);
    
    return null;
  }

  evaluateHand(player: PokerPlayer): number {
    // Simple hand evaluation - just use highest card for demo
    const allCards = [...player.hand, ...this.communityCards];
    const values = allCards.map(card => {
      const rank = card[0];
      switch (rank) {
        case 'A': return 14;
        case 'K': return 13;
        case 'Q': return 12;
        case 'J': return 11;
        default: return parseInt(rank);
      }
    });
    return Math.max(...values);
  }

  determineWinner(): PokerPlayer {
    const activePlayers = this.players.filter(p => !p.folded && !p.eliminated);
    let winner = activePlayers[0];
    let bestScore = this.evaluateHand(winner);

    for (const player of activePlayers.slice(1)) {
      const score = this.evaluateHand(player);
      if (score > bestScore) {
        winner = player;
        bestScore = score;
      }
    }

    winner.handsWon++;
    winner.chips += this.pot;
    winner.biggestPot = Math.max(winner.biggestPot, this.pot);
    return winner;
  }

  eliminatePlayers() {
    for (const player of this.players) {
      if (!player.eliminated && player.chips <= 0) {
        player.eliminated = true;
        this.activePlayers--;
        
        // Assign rank based on elimination order
        player.rank = this.players.filter(p => p.eliminated).length;
      }
    }
  }

  nextPhase() {
    switch (this.phase) {
      case 'preflop':
        this.phase = 'flop';
        this.communityCards = [this.deck.pop()!, this.deck.pop()!, this.deck.pop()!];
        break;
      case 'flop':
        this.phase = 'turn';
        this.communityCards.push(this.deck.pop()!);
        break;
      case 'turn':
        this.phase = 'river';
        this.communityCards.push(this.deck.pop()!);
        break;
      case 'river':
        this.phase = 'showdown';
        break;
    }
    this.currentPlayerIndex = 0;
    this.currentBet = 0;
    for (const player of this.players) {
      player.bet = 0;
    }
  }

  fold(playerIndex: number) {
    const player = this.players[playerIndex];
    player.folded = true;
    this.lastAction = `${player.id} folds`;
    this.nextPlayer();
  }

  call(playerIndex: number) {
    const player = this.players[playerIndex];
    const toCall = this.currentBet - player.bet;
    player.chips -= toCall;
    player.bet = this.currentBet;
    this.pot += toCall;
    this.lastAction = `${player.id} calls ${toCall}`;
    this.nextPlayer();
  }

  raise(playerIndex: number, amount: number) {
    const player = this.players[playerIndex];
    const toCall = this.currentBet - player.bet;
    const totalBet = toCall + amount;
    player.chips -= totalBet;
    player.bet = this.currentBet + amount;
    this.currentBet = player.bet;
    this.pot += totalBet;
    this.lastAction = `${player.id} raises to ${this.currentBet}`;
    this.nextPlayer();
  }

  check(playerIndex: number) {
    const player = this.players[playerIndex];
    this.lastAction = `${player.id} checks`;
    this.nextPlayer();
  }

  private nextPlayer() {
    let allActed = true;
    let activePlayers = 0;

    // Find next non-folded, non-eliminated player
    do {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      const player = this.players[this.currentPlayerIndex];
      if (!player.folded && !player.eliminated) {
        activePlayers++;
        if (player.bet < this.currentBet) {
          allActed = false;
        }
      }
    } while ((this.players[this.currentPlayerIndex].folded || 
              this.players[this.currentPlayerIndex].eliminated) && 
             activePlayers > 1);

    // If all players have acted or only one player remains, move to next phase
    if (allActed || activePlayers === 1) {
      this.nextPhase();
    }
  }
}

export async function POST(req: NextRequest) {
  const settings: GameSettings = await req.json();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const table = new PokerTable(settings.blinds.small, settings.blinds.big);

        // Add players
        for (let i = 0; i < settings.playerCount; i++) {
          table.addPlayer(settings.startingChips);
        }

        // Tournament loop
        while (table.activePlayers > 1) {
          // Start new hand
          table.dealCards();

          // Send initial hand state
          controller.enqueue(JSON.stringify({
            type: 'gameState',
            data: {
              players: table.players.map(p => ({
                id: p.id,
                name: p.id,
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
              })),
              pot: table.pot,
              communityCards: table.communityCards,
              currentBet: table.currentBet,
              currentPlayer: table.currentPlayerIndex,
              phase: table.phase,
              lastAction: table.lastAction,
              handNumber: table.handNumber,
            },
          }) + '\n');

          // Play hand
          while (table.phase !== 'showdown') {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const playerIndex = table.currentPlayerIndex;
            const player = table.players[playerIndex];
            
            if (!player.folded && !player.eliminated) {
              if (table.currentBet > player.bet) {
                if (Math.random() > 0.3) {
                  table.call(playerIndex);
                } else {
                  table.fold(playerIndex);
                }
              } else {
                if (Math.random() > 0.5) {
                  table.check(playerIndex);
                } else {
                  const maxRaise = Math.min(
                    player.chips,
                    table.currentBet + settings.blinds.big * 2
                  );
                  if (maxRaise > 0) {
                    table.raise(playerIndex, maxRaise);
                  } else {
                    table.check(playerIndex);
                  }
                }
              }
            }

            // Send updated state
            controller.enqueue(JSON.stringify({
              type: 'gameState',
              data: {
                players: table.players.map(p => ({
                  id: p.id,
                  name: p.id,
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
                })),
                pot: table.pot,
                communityCards: table.communityCards,
                currentBet: table.currentBet,
                currentPlayer: table.currentPlayerIndex,
                phase: table.phase,
                lastAction: table.lastAction,
                handNumber: table.handNumber,
              },
            }) + '\n');
          }

          // Determine winner and award pot
          const handWinner = table.determineWinner();
          table.lastAction = `${handWinner.id} wins pot of ${table.pot}`;

          // Eliminate players with no chips
          table.eliminatePlayers();

          // Send end of hand state
          controller.enqueue(JSON.stringify({
            type: 'gameState',
            data: {
              players: table.players.map(p => ({
                id: p.id,
                name: p.id,
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
              })),
              pot: table.pot,
              communityCards: table.communityCards,
              currentBet: table.currentBet,
              currentPlayer: table.currentPlayerIndex,
              phase: table.phase,
              lastAction: table.lastAction,
              handNumber: table.handNumber,
              winners: table.activePlayers === 1 ? 
                table.players
                  .filter(p => !p.eliminated || p.rank! <= 3)
                  .sort((a, b) => (a.rank || 999) - (b.rank || 999))
                  .slice(0, 3)
                  .map(p => ({
                    id: p.id,
                    name: p.id,
                    chips: p.chips,
                    handsWon: p.handsWon,
                    handsPlayed: p.handsPlayed,
                    totalBets: p.totalBets,
                    biggestPot: p.biggestPot,
                    rank: p.rank!,
                  })) : undefined,
            },
          }) + '\n');

          table.handNumber++;
          await new Promise(resolve => setTimeout(resolve, 3000));
        }

        controller.close();
      } catch (error) {
        console.error('Tournament error:', error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
} 