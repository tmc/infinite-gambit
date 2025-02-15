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
  }[];
  pot: number;
  communityCards: string[];
  currentBet: number;
  currentPlayer: number;
  phase: string;
  lastAction?: string;
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
    return player;
  }

  dealCards() {
    // Reset state
    this.communityCards = [];
    this.pot = 0;
    this.currentBet = this.bigBlind;
    this.phase = 'preflop';
    this.currentPlayerIndex = 2; // Start after big blind
    
    // Deal hole cards
    for (const player of this.players) {
      player.hand = [this.deck.pop()!, this.deck.pop()!];
      player.bet = 0;
      player.folded = false;
    }

    // Post blinds
    if (this.players.length >= 2) {
      const sbPlayer = this.players[0];
      const bbPlayer = this.players[1];
      sbPlayer.bet = this.smallBlind;
      sbPlayer.chips -= this.smallBlind;
      bbPlayer.bet = this.bigBlind;
      bbPlayer.chips -= this.bigBlind;
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

    // Find next non-folded player
    do {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      const player = this.players[this.currentPlayerIndex];
      if (!player.folded) {
        activePlayers++;
        if (player.bet < this.currentBet) {
          allActed = false;
        }
      }
    } while (this.players[this.currentPlayerIndex].folded && activePlayers > 1);

    // If all players have acted or only one player remains, move to next phase
    if (allActed || activePlayers === 1) {
      this.nextPhase();
    }
  }
}

export async function POST(req: NextRequest) {
  const settings: GameSettings = await req.json();
  
  // Initialize stream
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Initialize poker table
        const table = new PokerTable(settings.blinds.small, settings.blinds.big);

        // Add players
        for (let i = 0; i < settings.playerCount; i++) {
          table.addPlayer(settings.startingChips);
        }

        // Start the game
        table.dealCards();

        // Send initial game state
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
            })),
            pot: table.pot,
            communityCards: table.communityCards,
            currentBet: table.currentBet,
            currentPlayer: table.currentPlayerIndex,
            phase: table.phase,
            lastAction: table.lastAction,
          },
        }) + '\n');

        // Simulate game progression
        while (table.phase !== 'showdown') {
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Simulate current player action
          const playerIndex = table.currentPlayerIndex;
          const player = table.players[playerIndex];
          
          if (!player.folded) {
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

          // Send updated game state
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
              })),
              pot: table.pot,
              communityCards: table.communityCards,
              currentBet: table.currentBet,
              currentPlayer: table.currentPlayerIndex,
              phase: table.phase,
              lastAction: table.lastAction,
            },
          }) + '\n');
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