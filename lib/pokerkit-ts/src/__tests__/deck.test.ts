import { Deck } from '../lib/deck';
import { Card, Rank, Suit } from '../types/card';

describe('Deck', () => {
  describe('createStandard', () => {
    it('should create a standard 52-card deck', () => {
      const deck = Deck.createStandard();
      expect(deck.remaining).toBe(52);
      
      // Check if all cards are unique
      const cards = deck.allCards;
      const uniqueCards = new Set(cards.map(card => card.toString()));
      expect(uniqueCards.size).toBe(52);
    });
  });

  describe('createShortDeckHoldem', () => {
    it('should create a 36-card short deck', () => {
      const deck = Deck.createShortDeckHoldem();
      expect(deck.remaining).toBe(36);
      
      // Verify no cards below 6
      const cards = deck.allCards;
      const hasLowCards = cards.some(card => 
        [Rank.DEUCE, Rank.TREY, Rank.FOUR, Rank.FIVE].includes(card.rank)
      );
      expect(hasLowCards).toBe(false);
    });
  });

  describe('createKuhnPoker', () => {
    it('should create a 3-card Kuhn poker deck', () => {
      const deck = Deck.createKuhnPoker();
      expect(deck.remaining).toBe(3);
      
      const cards = deck.allCards;
      expect(cards.every(card => card.suit === Suit.SPADE)).toBe(true);
      expect(cards.map(card => card.rank)).toEqual(
        expect.arrayContaining([Rank.JACK, Rank.QUEEN, Rank.KING])
      );
    });
  });

  describe('shuffle and draw', () => {
    it('should shuffle and draw cards correctly', () => {
      const deck = Deck.createStandard();
      const originalOrder = [...deck.allCards];
      
      deck.shuffle();
      const shuffledOrder = [...deck.allCards];
      
      // Check that cards are in different order (this could theoretically fail)
      expect(shuffledOrder).not.toEqual(originalOrder);
      
      // Draw some cards
      const drawn = deck.drawMany(5);
      expect(drawn).toHaveLength(5);
      expect(deck.remaining).toBe(47);
      
      // Check that drawn cards are no longer in deck
      const remainingCards = deck.allCards;
      drawn.forEach(drawnCard => {
        expect(remainingCards.map(c => c.toString()))
          .not.toContain(drawnCard.toString());
      });
    });

    it('should handle drawing more cards than available', () => {
      const deck = Deck.createKuhnPoker();
      const drawn = deck.drawMany(5); // Try to draw 5 from 3-card deck
      expect(drawn).toHaveLength(3); // Should only get 3 cards
      expect(deck.remaining).toBe(0);
    });
  });
}); 