import { Agent, AgentType, getAgentLogo } from './agents/Agent';
import { OpenAIAgent } from './agents/OpenAIAgent';
import { AnthropicAgent } from './agents/AnthropicAgent';
import { DeepseekAgent } from './agents/DeepseekAgent';
import { LocalAgent } from './agents/LocalAgent';

export type PlayerStyle = 'aggressive' | 'conservative' | 'balanced' | 'unpredictable';

export type PlayerPersonality = {
  style: PlayerStyle;
  riskTolerance: number; // 0-1
  bluffFrequency: number; // 0-1
  name: string;
  description: string;
  agentType: AgentType;
};

const PERSONALITIES: PlayerPersonality[] = [
  {
    style: 'aggressive',
    riskTolerance: 0.8,
    bluffFrequency: 0.4,
    name: 'The Shark',
    description: 'Aggressive player who loves to raise and put pressure on opponents',
    agentType: 'openai'
  },
  {
    style: 'conservative',
    riskTolerance: 0.2,
    bluffFrequency: 0.1,
    name: 'The Rock',
    description: 'Tight player who only plays premium hands',
    agentType: 'anthropic'
  },
  {
    style: 'balanced',
    riskTolerance: 0.5,
    bluffFrequency: 0.25,
    name: 'The Pro',
    description: 'Well-rounded player who adapts to the situation',
    agentType: 'deepseek'
  },
  {
    style: 'unpredictable',
    riskTolerance: 0.6,
    bluffFrequency: 0.6,
    name: 'The Wild Card',
    description: 'Unpredictable player who keeps opponents guessing',
    agentType: 'local'
  }
];

export const getRandomPersonality = (): PlayerPersonality => {
  return PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)];
};

type GameContext = {
  hand: string[];
  communityCards: string[];
  phase: string;
  pot: number;
  currentBet: number;
  playerChips: number;
  position: 'early' | 'late';
  numActivePlayers: number;
  opponents: {
    name: string;
    chips: number;
    bet: number;
    folded: boolean;
    eliminated: boolean;
    personality?: PlayerPersonality;
  }[];
};

type HandRank = 'high card' | 'pair' | 'two pair' | 'three of a kind' | 'straight' | 'flush' | 'full house' | 'four of a kind' | 'straight flush' | 'royal flush';

type HandAnalysis = {
  rank: HandRank;
  strength: number; // 0-1
  description: string;
};

export class PlayerAgent {
  personality: PlayerPersonality;
  private lastDecisionContext?: string;
  private lastHandAnalysis?: HandAnalysis;
  private agent: Agent;

  constructor(personality: PlayerPersonality) {
    this.personality = personality;
    this.agent = this.createAgent(personality.agentType);
  }

  private createAgent(type: AgentType): Agent {
    switch (type) {
      case 'openai':
        return new OpenAIAgent();
      case 'anthropic':
        return new AnthropicAgent();
      case 'deepseek':
        return new DeepseekAgent();
      default:
        return new LocalAgent();
    }
  }

  private analyzeHand(hand: string[], communityCards: string[]): HandAnalysis {
    // Convert cards to a more analyzable format
    const allCards = [...hand, ...communityCards].filter(c => c !== 'X');
    if (allCards.length < 2) return { rank: 'high card', strength: 0, description: 'No valid cards' };

    const ranks = allCards.map(c => c[0]);
    const suits = allCards.map(c => c[1]);

    // Count rank frequencies
    const rankCounts = ranks.reduce((acc, r) => {
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Count suit frequencies
    const suitCounts = suits.reduce((acc, s) => {
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Check for pairs, three of a kind, etc.
    const pairs = Object.values(rankCounts).filter(c => c === 2).length;
    const threeOfKind = Object.values(rankCounts).some(c => c === 3);
    const fourOfKind = Object.values(rankCounts).some(c => c === 4);
    const flush = Object.values(suitCounts).some(c => c >= 5);

    // Determine hand rank and strength
    if (fourOfKind) {
      return {
        rank: 'four of a kind',
        strength: 0.9,
        description: 'Four of a kind'
      };
    } else if (threeOfKind && pairs > 0) {
      return {
        rank: 'full house',
        strength: 0.8,
        description: 'Full house'
      };
    } else if (flush) {
      return {
        rank: 'flush',
        strength: 0.7,
        description: 'Flush'
      };
    } else if (threeOfKind) {
      return {
        rank: 'three of a kind',
        strength: 0.6,
        description: 'Three of a kind'
      };
    } else if (pairs === 2) {
      return {
        rank: 'two pair',
        strength: 0.4,
        description: 'Two pair'
      };
    } else if (pairs === 1) {
      return {
        rank: 'pair',
        strength: 0.2,
        description: 'One pair'
      };
    }

    // High card with some intelligence about card strength
    const highestRank = Math.max(...ranks.map(r => {
      const rankMap: Record<string, number> = {
        'A': 14, 'K': 13, 'Q': 12, 'J': 11, 'T': 10,
        '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
      };
      return rankMap[r] || 0;
    }));

    return {
      rank: 'high card',
      strength: Math.min((highestRank - 2) / 12, 0.1),
      description: `High card ${ranks.find(r => r === 'A' || r === 'K' || r === 'Q')}`
    };
  }

  private formatGameState(context: GameContext): string {
    const { hand, communityCards, phase, pot, currentBet, playerChips, opponents } = context;
    const handAnalysis = this.analyzeHand(hand, communityCards);
    this.lastHandAnalysis = handAnalysis;
    
    const activeOpponents = opponents.filter(o => !o.folded && !o.eliminated);
    const opponentInfo = activeOpponents.map(o => 
      `${o.name} (${o.personality?.style || 'unknown'}) - ${o.chips} chips, bet: ${o.bet}`
    ).join('\n');

    return `You are playing Texas Hold'em Poker. You are ${this.personality.name}.

Game State:
- Your hand: ${hand.join(', ')} (${handAnalysis.description})
- Community cards: ${communityCards.length ? communityCards.join(', ') : 'none'}
- Phase: ${phase}
- Pot: ${pot}
- Current bet to call: ${currentBet}
- Your chips: ${playerChips}
- Position: ${context.position}

Active opponents:
${opponentInfo}

Your personality: ${this.personality.description}
Style: ${this.personality.style}
Risk tolerance: ${this.personality.riskTolerance}
Bluff frequency: ${this.personality.bluffFrequency}

Based on your personality and the current game state, what action would you take?
Respond with one of:
1. fold
2. call
3. raise <amount>

Then provide a brief explanation of your decision in character.`;
  }

  private async getDecision(context: GameContext): Promise<{ action: string; amount?: number; explanation: string }> {
    const prompt = this.formatGameState(context);
    this.lastDecisionContext = prompt;

    // In test environment, always use fallback logic
    if (process.env.NODE_ENV === 'test') {
      return this.getFallbackDecision(context);
    }

    try {
      const text = await this.agent.generateResponse(
        prompt,
        this.personality.style === 'unpredictable' ? 0.8 : 0.2
      );

      // Parse decision
      const lowerText = text.toLowerCase();
      if (lowerText.includes('fold')) {
        return { action: 'fold', explanation: text };
      } else if (lowerText.includes('raise')) {
        const amount = parseInt(lowerText.match(/raise (\d+)/)?.[1] || '0');
        return { action: 'raise', amount, explanation: text };
      } else {
        return { action: 'call', explanation: text };
      }
    } catch (error) {
      console.error('AI agent failed, using fallback logic:', error);
      return this.getFallbackDecision(context);
    }
  }

  async decideAction(context: GameContext): Promise<{ action: string; amount?: number }> {
    const { action, amount, explanation } = await this.getDecision(context);
    // Only log in non-test mode
    if (process.env.NODE_ENV !== 'test') {
      console.log(`\nPlayer ${this.personality.name} decision process:\n${explanation}`);
    }
    return { action, amount };
  }

  async getCommentary(decision: { action: string; amount?: number }): Promise<string> {
    // In test environment, use minimal commentary
    if (process.env.NODE_ENV === 'test') {
      return '';
    }

    try {
        const prompt = `You are ${this.personality.name}, a poker player with the following personality: ${this.personality.description}

You just decided to ${decision.action}${decision.amount ? ` with amount ${decision.amount}` : ''}.

Previous context:
${this.lastDecisionContext || 'No context available'}

Provide a brief, in-character explanation of your decision.`;

        return await this.agent.generateResponse(prompt, 0.7);
    } catch (error) {
        console.error('AI commentary failed, using fallback:', error);
        return this.getDefaultCommentary(decision);
    }
  }

  private getDefaultCommentary(decision: { action: string; amount?: number }): string {
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

  private getFallbackDecision(context: GameContext): { action: string; amount?: number; explanation: string } {
    const handAnalysis = this.lastHandAnalysis || this.analyzeHand(context.hand, context.communityCards);
    const { style, riskTolerance, bluffFrequency } = this.personality;
    
    // Basic decision making based on hand strength and personality
    const effectiveStrength = handAnalysis.strength * (1 + riskTolerance);
    const shouldBluff = Math.random() < bluffFrequency;
    
    if (shouldBluff && context.playerChips > context.currentBet * 3) {
      const amount = Math.min(
        context.currentBet * 3,
        context.playerChips,
        context.pot * (riskTolerance + 0.5)
      );
      return {
        action: 'raise',
        amount: Math.floor(amount),
        explanation: process.env.NODE_ENV === 'test' ? '' : `${this.personality.name} decides to bluff with a confident demeanor`
      };
    }

    if (effectiveStrength < 0.2 && style !== 'aggressive') {
      return {
        action: 'fold',
        explanation: process.env.NODE_ENV === 'test' ? '' : `${this.personality.name} carefully considers and decides to fold`
      };
    }

    return {
      action: 'call',
      explanation: process.env.NODE_ENV === 'test' ? '' : `${this.personality.name} makes a measured call`
    };
  }
} 