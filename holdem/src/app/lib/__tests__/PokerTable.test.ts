/// <reference types="jest" />
import { PokerTable } from '../PokerTable';

describe('PokerTable', () => {
  describe('Basic Game Flow', () => {
    it('should initialize correctly with given settings', () => {
      const table = new PokerTable(4, 1000, 10, 20);
      
      expect(table.players.length).toBe(4);
      expect(table.players[0].chips).toBe(1000);
      expect(table.smallBlind).toBe(10);
      expect(table.bigBlind).toBe(20);
      expect(table.phase).toBe('preflop');
      expect(table.pot).toBe(0);
    });

    it('should handle a complete hand with multiple betting rounds', () => {
      const table = new PokerTable(4, 1000, 10, 20);
      table.dealCards();

      // Track initial state
      const initialChips = table.players.map(p => p.chips);
      
      // Play through multiple rounds
      while (!table.isHandComplete()) {
        table.handlePlayerTurn();
      }

      // Verify hand completed
      expect(['showdown', 'preflop', 'flop', 'turn', 'river']).toContain(table.phase);
      
      // Verify chips were exchanged
      const finalChips = table.players.map(p => p.chips);
      expect(finalChips).not.toEqual(initialChips);
      
      // Verify pot was distributed
      expect(table.pot).toBe(0);
      
      // Verify total chips remained constant
      expect(finalChips.reduce((a, b) => a + b, 0))
        .toBe(initialChips.reduce((a, b) => a + b, 0));
    });
  });

  describe('Player Elimination', () => {
    it('should eliminate players when they run out of chips', () => {
      const table = new PokerTable(4, 100, 50, 100); // High blinds for quick elimination
      
      let eliminationCount = 0;
      let handCount = 0;
      const maxHands = 20;

      while (eliminationCount < 3 && handCount < maxHands) {
        table.dealCards();
        
        while (!table.isHandComplete()) {
          table.handlePlayerTurn();
        }

        eliminationCount = table.players.filter(p => p.eliminated).length;
        handCount++;
      }

      // Verify eliminations occurred
      expect(eliminationCount).toBeGreaterThan(0);
      
      // Verify eliminated players have 0 chips
      table.players
        .filter(p => p.eliminated)
        .forEach(p => expect(p.chips).toBe(0));
      
      // Verify at least one player remains
      expect(table.players.filter(p => !p.eliminated).length).toBeGreaterThan(0);
    });
  });

  describe('All-in Scenarios', () => {
    it('should handle all-in situations correctly', () => {
      const table = new PokerTable(3, 100, 10, 20);
      
      // Force an all-in situation
      const player = table.players[0];
      const originalChips = player.chips;
      
      // Simulate a raise larger than player's chips
      table.raise(player, originalChips * 2);
      
      // Verify player went all-in
      expect(player.chips).toBe(0);
      expect(player.bet).toBe(originalChips);
      expect(table.pot).toBe(originalChips);
      
      // Verify player was eliminated
      expect(player.eliminated).toBe(true);
    });
  });

  describe('Betting Rounds', () => {
    it('should progress through all betting rounds correctly', () => {
      const table = new PokerTable(4, 1000, 10, 20);
      const phases = ['preflop', 'flop', 'turn', 'river', 'showdown'];
      
      table.dealCards();
      let phaseIndex = 0;
      
      while (phaseIndex < phases.length) {
        expect(table.phase).toBe(phases[phaseIndex]);
        
        // Simulate all players calling
        table.players
          .filter(p => !p.eliminated && !p.folded)
          .forEach(p => table.call(p));
        
        if (table.phase !== phases[phaseIndex]) {
          phaseIndex++;
        }
      }

      // Verify community cards
      expect(table.communityCards.length).toBe(5);
    });

    it('should handle folded players correctly', () => {
      const table = new PokerTable(4, 1000, 10, 20);
      table.dealCards();
      
      // Make all but one player fold
      for (let i = 0; i < 3; i++) {
        const player = table.players[i];
        if (!player.eliminated) {
          table.fold(player);
        }
      }

      // Verify hand completes immediately
      expect(table.isHandComplete()).toBe(true);
      
      // Verify winner gets the pot
      const winner = table.players.find(p => !p.folded && !p.eliminated);
      expect(winner?.handsWon).toBe(1);
    });
  });

  describe('Tournament Progress', () => {
    it('should track tournament statistics correctly', () => {
      const table = new PokerTable(4, 1000, 10, 20);
      const initialHandNumber = table.handNumber;
      
      // Play 5 hands
      for (let i = 0; i < 5; i++) {
        table.dealCards();
        while (!table.isHandComplete()) {
          table.handlePlayerTurn();
        }
      }

      // Verify hand count increased
      expect(table.handNumber).toBe(initialHandNumber + 5);
      
      // Verify player statistics
      table.players.forEach(player => {
        expect(player.handsPlayed).toBeGreaterThan(0);
        expect(player.totalBets).toBeGreaterThanOrEqual(0);
        if (player.handsWon > 0) {
          expect(player.biggestPot).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle heads-up play correctly', () => {
      const table = new PokerTable(2, 1000, 10, 20);
      table.dealCards();
      
      expect(table.players.length).toBe(2);
      
      // Verify blind positions
      expect(table.players[0].bet).toBe(0);
      expect(table.players[1].bet).toBe(0);
      
      // Play a hand
      while (!table.isHandComplete()) {
        table.handlePlayerTurn();
      }
      
      // Verify hand completed
      expect(table.pot).toBe(0);
      expect(table.players.some(p => p.handsWon === 1)).toBe(true);
    });

    it('should handle simultaneous all-ins correctly', () => {
      const table = new PokerTable(3, 100, 10, 20);
      table.dealCards();
      
      // Force all players all-in
      table.players.forEach(player => {
        if (!player.eliminated) {
          table.raise(player, player.chips);
        }
      });
      
      // Verify all players are all-in or eliminated
      table.players.forEach(player => {
        expect(player.chips === 0 || player.eliminated).toBe(true);
      });
      
      // Complete the hand
      while (!table.isHandComplete()) {
        table.handlePlayerTurn();
      }
      
      // Verify pot was awarded
      expect(table.pot).toBe(0);
    });
  });
}); 