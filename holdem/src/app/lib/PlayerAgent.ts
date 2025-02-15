export type PlayerStyle = 'aggressive' | 'conservative' | 'balanced' | 'unpredictable';

export type PlayerPersonality = {
  style: PlayerStyle;
  riskTolerance: number; // 0-1
  bluffFrequency: number; // 0-1
  name: string;
  description: string;
};

const PERSONALITIES: PlayerPersonality[] = [
  {
    style: 'aggressive',
    riskTolerance: 0.8,
    bluffFrequency: 0.4,
    name: 'The Shark',
    description: 'Aggressive player who loves to raise and put pressure on opponents'
  },
  {
    style: 'conservative',
    riskTolerance: 0.2,
    bluffFrequency: 0.1,
    name: 'The Rock',
    description: 'Tight player who only plays premium hands'
  },
  {
    style: 'balanced',
    riskTolerance: 0.5,
    bluffFrequency: 0.25,
    name: 'The Pro',
    description: 'Well-rounded player who adapts to the situation'
  },
  {
    style: 'unpredictable',
    riskTolerance: 0.6,
    bluffFrequency: 0.6,
    name: 'The Wild Card',
    description: 'Unpredictable player who keeps opponents guessing'
  }
];

export const getRandomPersonality = (): PlayerPersonality => {
  return PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
};

type GameContext = {
  handStrength: number;
  potOdds: number;
  position: 'early' | 'late';
  currentBet: number;
  pot: number;
  playerChips: number;
  phase: string;
  numActivePlayers: number;
};

export class PlayerAgent {
  personality: PlayerPersonality;

  constructor(personality: PlayerPersonality) {
    this.personality = personality;
  }

  calculateHandStrength(hand: string[], communityCards: string[]): number {
    // Simplified hand strength calculation
    // In a real implementation, this would use proper poker hand evaluation
    return Math.random(); // Placeholder
  }

  shouldBluff(context: GameContext): boolean {
    const { phase, numActivePlayers } = context;
    const bluffRoll = Math.random();
    
    // More likely to bluff in later streets with fewer players
    const situationalBluffFreq = this.personality.bluffFrequency * 
      (phase === 'river' ? 1.2 : 1) * 
      (numActivePlayers <= 3 ? 1.3 : 1);

    return bluffRoll < situationalBluffFreq;
  }

  decideAction(context: GameContext): { action: string; amount?: number } {
    const { handStrength, potOdds, position, currentBet, pot, playerChips } = context;
    const effectiveStrength = this.shouldBluff(context) ? 
      Math.max(handStrength, 0.7) : handStrength;

    // Basic decision making logic based on personality and context
    if (effectiveStrength < 0.3 && this.personality.riskTolerance < 0.7) {
      return { action: 'fold' };
    }

    const raiseFrequency = this.personality.style === 'aggressive' ? 0.4 :
      this.personality.style === 'conservative' ? 0.1 :
      this.personality.style === 'unpredictable' ? Math.random() : 0.25;

    if (Math.random() < raiseFrequency && playerChips > currentBet * 3) {
      const raiseAmount = Math.min(
        currentBet * 3,
        playerChips,
        pot * (this.personality.riskTolerance + 0.5)
      );
      return { action: 'raise', amount: Math.floor(raiseAmount) };
    }

    return { action: 'call' };
  }

  getCommentary(decision: { action: string; amount?: number }): string {
    const commentStyles = {
      aggressive: [
        'with a confident smirk',
        'pushing the action',
        'applying pressure',
      ],
      conservative: [
        'after careful consideration',
        'playing it safe',
        'with calculated precision',
      ],
      balanced: [
        'with perfect timing',
        'reading the situation',
        'maintaining balance',
      ],
      unpredictable: [
        'with a mischievous grin',
        'keeping everyone guessing',
        'mixing it up',
      ],
    };

    const style = this.personality.style;
    const comments = commentStyles[style];
    return comments[Math.floor(Math.random() * comments.length)];
  }
} 