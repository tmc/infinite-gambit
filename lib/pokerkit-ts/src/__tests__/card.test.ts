import { Card, Rank, Suit } from '../types/card';

describe('Card', () => {
  describe('constructor', () => {
    it('should create a card with valid rank and suit', () => {
      const card = new Card(Rank.ACE, Suit.SPADE);
      expect(card.rank).toBe(Rank.ACE);
      expect(card.suit).toBe(Suit.SPADE);
    });
  });

  describe('toString', () => {
    it('should return the correct string representation', () => {
      const card = new Card(Rank.ACE, Suit.SPADE);
      expect(card.toString()).toBe('As');
    });
  });

  describe('fromString', () => {
    it('should create a card from valid string', () => {
      const card = Card.fromString('As');
      expect(card.rank).toBe(Rank.ACE);
      expect(card.suit).toBe(Suit.SPADE);
    });

    it('should throw error for invalid string format', () => {
      expect(() => Card.fromString('Invalid')).toThrow('Invalid card string format');
    });

    it('should throw error for invalid rank or suit', () => {
      expect(() => Card.fromString('Xx')).toThrow('Invalid card rank or suit');
    });
  });

  describe('clean', () => {
    it('should clean string input', () => {
      const cards = Card.clean('AsKh');
      expect(cards).toHaveLength(2);
      expect(cards[0].toString()).toBe('As');
      expect(cards[1].toString()).toBe('Kh');
    });

    it('should clean array input', () => {
      const cards = Card.clean(['As', 'Kh']);
      expect(cards).toHaveLength(2);
      expect(cards[0].toString()).toBe('As');
      expect(cards[1].toString()).toBe('Kh');
    });

    it('should handle mixed array input', () => {
      const aceSpades = new Card(Rank.ACE, Suit.SPADE);
      const cards = Card.clean([aceSpades, 'Kh']);
      expect(cards).toHaveLength(2);
      expect(cards[0].toString()).toBe('As');
      expect(cards[1].toString()).toBe('Kh');
    });

    it('should throw error for invalid input', () => {
      expect(() => Card.clean(123 as any)).toThrow('Invalid cards format');
    });
  });
}); 