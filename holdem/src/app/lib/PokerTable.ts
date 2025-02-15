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

  constructor(numPlayers: number, startingChips: number, smallBlind: number = 10, bigBlind: number = 20) {
    this.smallBlind = smallBlind;
    this.bigBlind = bigBlind;
    
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

  simulatePlayerAction(player: PokerPlayer): { action: string; amount?: number } {
    const handStrength = player.agent.calculateHandStrength(player.hand, this.communityCards);
    const potOdds = this.currentBet / this.pot;
    const position = this.players.indexOf(player);
    const isLatePosition = position >= this.players.length - 2;

    const decision = player.agent.decideAction({
      handStrength,
      potOdds,
      position: isLatePosition ? 'late' : 'early',
      currentBet: this.currentBet,
      pot: this.pot,
      playerChips: player.chips,
      phase: this.phase,
      numActivePlayers: this.players.filter(p => !p.folded && !p.eliminated).length
    });

    return decision;
  }

  handlePlayerTurn() {
    const currentPlayer = this.players[this.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.folded || currentPlayer.eliminated) {
      console.log(`Skipping ${currentPlayer?.name || 'unknown'} (folded: ${currentPlayer?.folded}, eliminated: ${currentPlayer?.eliminated})`);
      this.nextPlayer();
      return;
    }

    console.log(`\nHandling turn for ${currentPlayer.name}`);
    console.log('Hand:', currentPlayer.hand);
    console.log('Chips:', currentPlayer.chips);
    console.log('Current bet:', currentPlayer.bet);

    const decision = this.simulatePlayerAction(currentPlayer);
    console.log('Decision:', decision);
    const commentary = currentPlayer.agent.getCommentary(decision);
    
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

    console.log('Action complete:', this.lastAction);
    this.nextPlayer();
  }

  nextPlayer() {
    do {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    } while (
      this.players[this.currentPlayerIndex].folded ||
      this.players[this.currentPlayerIndex].eliminated
    );
  }

  fold(player: PokerPlayer) {
    player.folded = true;
    player.handsPlayed++;
  }

  call(player: PokerPlayer) {
    const toCall = this.currentBet - player.bet;
    player.chips -= toCall;
    player.bet = this.currentBet;
    player.totalBets += toCall;
    this.pot += toCall;
    player.handsPlayed++;
  }

  raise(player: PokerPlayer, amount: number) {
    const toCall = this.currentBet - player.bet;
    const raiseAmount = amount - this.currentBet;
    player.chips -= (toCall + raiseAmount);
    player.bet = amount;
    player.totalBets += (toCall + raiseAmount);
    this.pot += (toCall + raiseAmount);
    this.currentBet = amount;
    player.handsPlayed++;
  }

  dealCards() {
    // Simple deck of cards (just for simulation)
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    const suits = ['♠', '♥', '♦', '♣'];
    const deck = ranks.flatMap(r => suits.map(s => r + s));
    
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    // Deal hole cards
    this.players.forEach(p => {
      if (!p.eliminated) {
        p.hand = [deck.pop()!, deck.pop()!];
        p.folded = false;
        p.bet = 0;
      }
    });
    
    // Reset community cards and pot
    this.communityCards = [];
    this.pot = 0;
    this.currentBet = 0;
    this.phase = 'preflop';
  }

  progressPhase() {
    console.log('\nProgressing phase from:', this.phase);
    switch (this.phase) {
      case 'preflop':
        this.phase = 'flop';
        this.communityCards = this.communityCards.concat(Array(3).fill('X'));
        break;
      case 'flop':
        this.phase = 'turn';
        this.communityCards.push('X');
        break;
      case 'turn':
        this.phase = 'river';
        this.communityCards.push('X');
        break;
      case 'river':
        this.phase = 'showdown';
        break;
    }
    console.log('New phase:', this.phase);
    console.log('Community cards:', this.communityCards);
    
    // Reset bets for new phase
    this.players.forEach(p => p.bet = 0);
    this.currentBet = 0;
    
    // Start with first non-eliminated player after dealer
    this.currentPlayerIndex = 0;
    while (this.players[this.currentPlayerIndex].eliminated) {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }
    console.log('Starting new phase with player:', this.players[this.currentPlayerIndex].name);
  }

  isHandComplete(): boolean {
    const activePlayers = this.players.filter(p => !p.folded && !p.eliminated);
    console.log('\nChecking hand completion:');
    console.log('Active players:', activePlayers.length);
    console.log('Phase:', this.phase);
    
    // Hand is complete if only one player remains or we're at showdown
    if (activePlayers.length === 1 || this.phase === 'showdown') {
      console.log('Hand complete - winner determination');
      // Award pot to winner
      const winner = activePlayers[0];
      console.log('Winner:', winner.name);
      console.log('Pot size:', this.pot);
      winner.chips += this.pot;
      winner.handsWon++;
      if (this.pot > winner.biggestPot) {
        winner.biggestPot = this.pot;
      }
      
      // Check for eliminations
      this.players.forEach(p => {
        if (!p.eliminated && p.chips <= 0) {
          console.log(`Player eliminated: ${p.name}`);
          p.eliminated = true;
          p.rank = this.players.filter(p => p.eliminated).length;
        }
      });
      
      return true;
    }
    
    // Check if betting is complete for current phase
    const betsMatch = activePlayers.every(p => p.bet === this.currentBet);
    console.log('Bets match:', betsMatch);
    console.log('Current bet:', this.currentBet);
    console.log('Player bets:', activePlayers.map(p => ({ name: p.name, bet: p.bet })));
    
    if (betsMatch && this.phase !== 'showdown') {
      console.log('Progressing to next phase');
      this.progressPhase();
    }
    
    return false;
  }

  // ... rest of the class implementation ...
} 