import { Card, Rank, Suit } from '../types/card';

export class RankOrder {
  static STANDARD = [
    Rank.DEUCE, Rank.TREY, Rank.FOUR, Rank.FIVE, Rank.SIX, Rank.SEVEN,
    Rank.EIGHT, Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING,
    Rank.ACE
  ];

  static SHORT_DECK_HOLDEM = [
    Rank.SIX, Rank.SEVEN, Rank.EIGHT, Rank.NINE, Rank.TEN, Rank.JACK,
    Rank.QUEEN, Rank.KING, Rank.ACE
  ];

  static REGULAR = [
    Rank.ACE, Rank.DEUCE, Rank.TREY, Rank.FOUR, Rank.FIVE, Rank.SIX,
    Rank.SEVEN, Rank.EIGHT, Rank.NINE, Rank.TEN, Rank.JACK, Rank.QUEEN,
    Rank.KING
  ];

  static EIGHT_OR_BETTER_LOW = [
    Rank.ACE, Rank.DEUCE, Rank.TREY, Rank.FOUR, Rank.FIVE, Rank.SIX,
    Rank.SEVEN, Rank.EIGHT
  ];

  static KUHN_POKER = [Rank.JACK, Rank.QUEEN, Rank.KING];
}

export class Deck {
  private cards: Card[];

  constructor(cards: Card[]) {
    this.cards = [...cards];
  }

  static createStandard(): Deck {
    const cards = RankOrder.STANDARD.flatMap(rank =>
      [Suit.CLUB, Suit.DIAMOND, Suit.HEART, Suit.SPADE].map(suit =>
        new Card(rank, suit)
      )
    );
    return new Deck(cards);
  }

  static createShortDeckHoldem(): Deck {
    const cards = RankOrder.SHORT_DECK_HOLDEM.flatMap(rank =>
      [Suit.CLUB, Suit.DIAMOND, Suit.HEART, Suit.SPADE].map(suit =>
        new Card(rank, suit)
      )
    );
    return new Deck(cards);
  }

  static createKuhnPoker(): Deck {
    const cards = RankOrder.KUHN_POKER.map(rank => new Card(rank, Suit.SPADE));
    return new Deck(cards);
  }

  shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw(): Card | undefined {
    return this.cards.pop();
  }

  drawMany(count: number): Card[] {
    const drawn: Card[] = [];
    for (let i = 0; i < count && this.cards.length > 0; i++) {
      const card = this.draw();
      if (card) drawn.push(card);
    }
    return drawn;
  }

  get remaining(): number {
    return this.cards.length;
  }

  get allCards(): Card[] {
    return [...this.cards];
  }
} 