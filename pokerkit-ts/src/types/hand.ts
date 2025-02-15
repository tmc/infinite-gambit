import { Card, CardsLike } from './card';

export enum HandRank {
  HIGH_CARD = 'High card',
  ONE_PAIR = 'One pair',
  TWO_PAIR = 'Two pair',
  THREE_OF_A_KIND = 'Three of a kind',
  STRAIGHT = 'Straight',
  FLUSH = 'Flush',
  FULL_HOUSE = 'Full house',
  FOUR_OF_A_KIND = 'Four of a kind',
  STRAIGHT_FLUSH = 'Straight flush'
}

export interface HandEvaluator {
  evaluate(cards: Card[]): HandRank;
  compare(hand1: Card[], hand2: Card[]): number;
}

export abstract class Hand {
  protected cards: Card[];
  protected rank: HandRank;

  constructor(cards: CardsLike) {
    this.cards = Card.clean(cards);
    this.rank = this.evaluate();
  }

  abstract evaluate(): HandRank;

  toString(): string {
    return `${this.rank}: ${this.cards.map(card => card.toString()).join(' ')}`;
  }

  compareTo(other: Hand): number {
    if (this.rank !== other.rank) {
      return Object.values(HandRank).indexOf(this.rank) - 
             Object.values(HandRank).indexOf(other.rank);
    }
    return this.compareEqualRank(other);
  }

  protected abstract compareEqualRank(other: Hand): number;

  static from_game(hole_cards: CardsLike, board_cards: CardsLike = []): Hand {
    throw new Error('Method must be implemented by subclass');
  }
}

export abstract class CombinationHand extends Hand {
  static readonly card_count: number;

  protected validateCardCount(): void {
    const expectedCount = (this.constructor as typeof CombinationHand).card_count;
    if (this.cards.length !== expectedCount) {
      throw new Error(`Invalid number of cards. Expected ${expectedCount}, got ${this.cards.length}`);
    }
  }
}

export class StandardHand extends CombinationHand {
  static readonly card_count = 5;

  evaluate(): HandRank {
    this.validateCardCount();
    
    // Check for straight flush
    if (this.isStraightFlush()) return HandRank.STRAIGHT_FLUSH;
    
    // Check for four of a kind
    if (this.isFourOfAKind()) return HandRank.FOUR_OF_A_KIND;
    
    // Check for full house
    if (this.isFullHouse()) return HandRank.FULL_HOUSE;
    
    // Check for flush
    if (this.isFlush()) return HandRank.FLUSH;
    
    // Check for straight
    if (this.isStraight()) return HandRank.STRAIGHT;
    
    // Check for three of a kind
    if (this.isThreeOfAKind()) return HandRank.THREE_OF_A_KIND;
    
    // Check for two pair
    if (this.isTwoPair()) return HandRank.TWO_PAIR;
    
    // Check for one pair
    if (this.isOnePair()) return HandRank.ONE_PAIR;
    
    // High card
    return HandRank.HIGH_CARD;
  }

  protected compareEqualRank(other: Hand): number {
    // Implementation will depend on the specific hand rank
    // This is a simplified version
    return 0;
  }

  private isStraightFlush(): boolean {
    return this.isFlush() && this.isStraight();
  }

  private isFourOfAKind(): boolean {
    const rankCounts = this.getRankCounts();
    return Object.values(rankCounts).some(count => count === 4);
  }

  private isFullHouse(): boolean {
    const rankCounts = this.getRankCounts();
    const counts = Object.values(rankCounts);
    return counts.includes(3) && counts.includes(2);
  }

  private isFlush(): boolean {
    return new Set(this.cards.map(card => card.suit)).size === 1;
  }

  private isStraight(): boolean {
    const ranks = this.cards.map(card => card.rank).sort();
    // TODO: Implement straight check logic
    return false;
  }

  private isThreeOfAKind(): boolean {
    const rankCounts = this.getRankCounts();
    return Object.values(rankCounts).some(count => count === 3);
  }

  private isTwoPair(): boolean {
    const rankCounts = this.getRankCounts();
    return Object.values(rankCounts).filter(count => count === 2).length === 2;
  }

  private isOnePair(): boolean {
    const rankCounts = this.getRankCounts();
    return Object.values(rankCounts).some(count => count === 2);
  }

  private getRankCounts(): { [key: string]: number } {
    return this.cards.reduce((counts, card) => {
      counts[card.rank] = (counts[card.rank] || 0) + 1;
      return counts;
    }, {} as { [key: string]: number });
  }
} 