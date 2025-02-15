export enum Rank {
  ACE = 'A',
  DEUCE = '2',
  TREY = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = 'T',
  JACK = 'J',
  QUEEN = 'Q',
  KING = 'K',
  UNKNOWN = '?'
}

export enum Suit {
  CLUB = 'c',
  DIAMOND = 'd',
  HEART = 'h',
  SPADE = 's',
  UNKNOWN = '?'
}

export class Card {
  constructor(
    public readonly rank: Rank,
    public readonly suit: Suit
  ) {}

  toString(): string {
    return `${this.rank}${this.suit}`;
  }

  static fromString(str: string): Card {
    if (str.length !== 2) {
      throw new Error('Invalid card string format');
    }
    const rank = str[0].toUpperCase() as Rank;
    const suit = str[1].toLowerCase() as Suit;
    if (!Object.values(Rank).includes(rank) || !Object.values(Suit).includes(suit)) {
      throw new Error('Invalid card rank or suit');
    }
    return new Card(rank, suit);
  }

  static clean(cards: CardsLike): Card[] {
    if (typeof cards === 'string') {
      return cards.match(/.{2}/g)?.map(str => Card.fromString(str)) || [];
    }
    if (Array.isArray(cards)) {
      return cards.map(card => card instanceof Card ? card : Card.fromString(card));
    }
    throw new Error('Invalid cards format');
  }
}

export type CardsLike = string | (string | Card)[]; 