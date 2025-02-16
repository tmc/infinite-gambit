import { PlayerAgent, type PlayerPersonality, getRandomPersonality } from './PlayerAgent';

export type PokerPlayer = {
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
  agent: PlayerAgent;
  personality: PlayerPersonality;
};

export class PokerTable {
  players: PokerPlayer[] = [];
  pot: number = 0;
  communityCards: string[] = [];
  currentBet: number = 0;
  currentPlayerIndex: number = 0;
  phase: string = 'preflop';
  lastAction?: string;
  handNumber: number = 0;
  smallBlind: number;
  bigBlind: number;
  initialSmallBlind: number;
  initialBigBlind: number;
  handsPerLevel: number;
  currentLevel: number = 1;
  private deck: string[] = [];

  constructor(
    numPlayers: number, 
    startingChips: number, 
    smallBlind: number = 10, 
    bigBlind: number = 20,
    handsPerLevel: number = 10
  ) {
    this.smallBlind = smallBlind;
    this.bigBlind = bigBlind;
    this.initialSmallBlind = smallBlind;
    this.initialBigBlind = bigBlind;
    this.handsPerLevel = handsPerLevel;
    
    // Initialize players with agents
    for (let i = 0; i < numPlayers; i++) {
      const personality = getRandomPersonality();
      const player: PokerPlayer = {
        id: `player-${i}`,
        name: `Player ${i + 1}`,
        chips: startingChips,
        hand: [],
        bet: 0,
        folded: false,
        handsWon: 0,
        handsPlayed: 0,
        totalBets: 0,
        biggestPot: 0,
        eliminated: false,
        personality,
        agent: new PlayerAgent(personality)
      };
      this.players.push(player);
    }
  }

  private checkBlindLevel() {
    const newLevel = Math.floor(this.handNumber / this.handsPerLevel) + 1;
    if (newLevel > this.currentLevel) {
      this.currentLevel = newLevel;
      this.smallBlind = this.initialSmallBlind * Math.pow(2, newLevel - 1);
      this.bigBlind = this.initialBigBlind * Math.pow(2, newLevel - 1);
      this.lastAction = `Blinds increased to ${this.smallBlind}/${this.bigBlind}`;
    }
  }

  private initializeDeck(): string[] {
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    const suits = ['♠', '♥', '♦', '♣'];
    const deck = ranks.flatMap(r => suits.map(s => r + s));
    
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
  }

  async simulatePlayerAction(player: PokerPlayer): Promise<{ action: string; amount?: number }> {
    const opponents = this.players
      .filter(p => p.id !== player.id && !p.eliminated)
      .map(p => ({
        name: p.name,
        chips: p.chips,
        bet: p.bet,
        folded: p.folded,
        eliminated: p.eliminated,
        personality: p.personality
      }));
    
    const activePlayers = this.players.filter(p => !p.folded && !p.eliminated);
    const activeIndex = activePlayers.findIndex(p => p.id === player.id);
    const position = activeIndex >= activePlayers.length - 2 ? 'late' : 'early';
    
    return player.agent.decideAction({
      hand: player.hand,
      communityCards: this.communityCards,
      phase: this.phase,
      pot: this.pot,
      currentBet: this.currentBet,
      playerChips: player.chips,
      position: position,
      numActivePlayers: activePlayers.length,
      opponents
    });
  }

  async handlePlayerTurn() {
    const currentPlayer = this.players[this.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.folded || currentPlayer.eliminated) {
      this.nextPlayer();
      return;
    }

    const decision = await this.simulatePlayerAction(currentPlayer);
    const commentary = await currentPlayer.agent.getCommentary(decision);
    
    if (decision.action === 'fold') {
      this.fold(currentPlayer);
      this.lastAction = `${currentPlayer.name} folds ${commentary}`;
    } else if (decision.action === 'call') {
      this.call(currentPlayer);
      this.lastAction = `${currentPlayer.name} calls ${this.currentBet} ${commentary}`;
    } else if (decision.action === 'raise' && decision.amount) {
      this.raise(currentPlayer, decision.amount);
      this.lastAction = `${currentPlayer.name} raises to ${decision.amount} ${commentary}`;
    }

    this.nextPlayer();
  }

  nextPlayer() {
    let attempts = 0;
    do {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      attempts++;
      if (attempts > this.players.length) break;
    } while (
      this.players[this.currentPlayerIndex].folded ||
      this.players[this.currentPlayerIndex].eliminated
    );
  }

  fold(player: PokerPlayer) {
    player.folded = true;
    player.handsPlayed++;
    
    // Check if player should be eliminated (folded with no chips)
    if (player.chips === 0) {
      this.checkElimination(player);
    }
  }

  call(player: PokerPlayer) {
    const toCall = this.currentBet - player.bet;
    const actualCall = Math.min(toCall, player.chips);
    player.chips -= actualCall;
    player.bet += actualCall;
    player.totalBets += actualCall;
    this.pot += actualCall;
    player.handsPlayed++;

    // Check for all-in
    if (player.chips === 0) {
        this.checkElimination(player);
    }
  }

  raise(player: PokerPlayer, amount: number) {
    // Enforce raise amount to be a multiple of the big blind
    const increment = this.bigBlind;
    amount = Math.round(amount / increment) * increment;
    
    // Enforce minimum raise amount: must be at least one big blind above current bet
    if (amount < this.currentBet + this.bigBlind) {
      amount = this.currentBet + this.bigBlind;
    }

    const toCall = this.currentBet - player.bet;
    const raiseAmount = amount - this.currentBet;
    const totalNeeded = Math.min(toCall + raiseAmount, player.chips);
    
    // Handle all-in
    if (totalNeeded >= player.chips) {
      // Player is going all-in
      this.pot += player.chips;
      player.bet = player.chips;
      player.totalBets += player.chips;
      player.chips = 0;
    } else {
      player.chips -= totalNeeded;
      player.bet += totalNeeded;
      player.totalBets += totalNeeded;
      this.pot += totalNeeded;
    }
    
    // Only update current bet if player had enough chips
    if (totalNeeded === toCall + raiseAmount) {
      this.currentBet = amount;
    } else {
      this.currentBet = Math.max(this.currentBet, player.bet);
    }
    player.handsPlayed++;

    // Check for all-in
    if (player.chips === 0) {
      this.checkElimination(player);
    }
  }

  private checkElimination(player: PokerPlayer) {
    if (player.chips === 0) {
      if (player.folded) {
        // Immediate elimination if player folded with no chips
        player.eliminated = true;
        player.rank = this.players.filter(p2 => !p2.eliminated).length + 1;
      } else if (this.phase === 'showdown') {
        // Eliminate after showdown if they didn't win
        const activePlayers = this.players.filter(p => !p.folded && !p.eliminated);
        const isWinner = activePlayers.some(p => p.id === player.id);
        if (!isWinner) {
          player.eliminated = true;
          player.rank = this.players.filter(p2 => !p2.eliminated).length + 1;
        }
      }
      // Otherwise, wait for hand to complete before elimination
    }
  }

  dealCards() {
    // Reset table state for new hand
    this.communityCards = [];
    this.pot = 0;
    this.currentBet = 0;
    this.phase = 'preflop';
    
    // Reset player states before dealing
    this.players.forEach(p => {
      if (!p.eliminated) {
        p.folded = false;
        p.bet = 0;
        p.hand = [];
      }
    });
    
    // Check blind levels before dealing
    this.checkBlindLevel();

    // Initialize and shuffle deck
    this.deck = this.initializeDeck();
    
    // Deal hole cards
    this.players.forEach(p => {
      if (!p.eliminated) {
        p.hand = [this.deck.pop()!, this.deck.pop()!];
      }
    });

    // Post blinds
    const activePlayers = this.players.filter(p => !p.eliminated);
    if (activePlayers.length >= 2) {
      const isHeadsUp = activePlayers.length === 2;
      
      // In heads-up play:
      // - Dealer (button) posts small blind
      // - Non-dealer posts big blind
      // - Dealer acts first preflop, last on all other streets
      const [nonDealer, dealer] = activePlayers;
      
      // Small blind (dealer in heads-up)
      const sbPlayer = isHeadsUp ? dealer : nonDealer;
      const sbAmount = Math.min(this.smallBlind, sbPlayer.chips);
      sbPlayer.chips -= sbAmount;
      sbPlayer.bet = sbAmount;
      sbPlayer.totalBets += sbAmount;
      this.pot += sbAmount;
      
      // Big blind (non-dealer in heads-up)
      const bbPlayer = isHeadsUp ? nonDealer : activePlayers[1];
      const bbAmount = Math.min(this.bigBlind, bbPlayer.chips);
      bbPlayer.chips -= bbAmount;
      bbPlayer.bet = bbAmount;
      bbPlayer.totalBets += bbAmount;
      this.pot += bbAmount;
      this.currentBet = bbAmount;

      // Check for all-in situations after posting blinds
      if (sbPlayer.chips === 0) {
        this.checkElimination(sbPlayer);
      }
      if (bbPlayer.chips === 0) {
        this.checkElimination(bbPlayer);
      }

      // In heads-up play, dealer (small blind) acts first preflop
      this.currentPlayerIndex = isHeadsUp ? 1 : 2 % activePlayers.length;
    }
  }

  async isHandComplete(): Promise<boolean> {
    const activePlayers = this.players.filter(p => !p.folded && !p.eliminated);
    const remainingPlayers = this.players.filter(p => !p.eliminated);
    
    // Tournament is complete if only one player remains
    if (remainingPlayers.length === 1) {
      // Ensure winner has all chips
      const winner = remainingPlayers[0];
      const totalChips = this.players.reduce((sum, p) => sum + p.chips, 0) + this.pot;
      winner.chips = totalChips;
      winner.rank = 1;
      return true;
    }
    
    if (activePlayers.length === 1 || this.phase === 'showdown') {
      const winner = activePlayers[0];
      if (winner) {
        winner.chips += this.pot;
        winner.handsWon++;
        winner.biggestPot = Math.max(winner.biggestPot, this.pot);
      }
      
      // Check for eliminations after pot distribution
      this.players.forEach(p => {
        if (!p.eliminated && p.chips === 0) {
          p.eliminated = true;
          p.rank = this.players.filter(p2 => !p2.eliminated).length + 1;
        }
      });

      // Reset bets and pot
      this.players.forEach(p => {
        p.bet = 0;
      });
      this.currentBet = 0;
      this.pot = 0; // Reset pot after distribution

      await this.rotatePositions();
      this.handNumber++; // Increment hand number after hand completes
      return true;
    }

    const betsMatch = activePlayers.every(p => p.bet === this.currentBet);
    if (betsMatch && this.phase !== 'showdown') {
      await this.progressPhase();
    }
    
    return false;
  }

  private async rotatePositions() {
    let rotations = 0;
    do {
      const first = this.players.shift();
      if (first) {
        this.players.push(first);
        rotations++;
      }
    } while (this.players[0].eliminated);

    // Only add delay in non-test environment
    if (process.env.NODE_ENV !== 'test') {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  async progressPhase() {
    this.players.forEach(p => p.bet = 0);
    this.currentBet = 0;

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
    while (
      this.players[this.currentPlayerIndex].folded ||
      this.players[this.currentPlayerIndex].eliminated
    ) {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }

    // Only add delay in non-test environment
    if (process.env.NODE_ENV !== 'test') {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // ... rest of the class implementation ...
} 