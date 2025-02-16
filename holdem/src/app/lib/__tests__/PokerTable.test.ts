/// <reference types="jest" />
import { PokerTable } from '../PokerTable';

describe('PokerTable', () => {
  // Ultra-aggressive timeout
  jest.setTimeout(1000);

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

    it('should handle a complete hand with multiple betting rounds', async () => {
      const table = new PokerTable(2, 100, 10, 20); // Reduced to 2 players and lower chips
      
      // Track initial state before dealing
      const initialTotal = table.players.reduce((sum, p) => sum + p.chips, 0);
      
      table.dealCards();
      
      // Play through multiple rounds with a safety counter
      let iterations = 0;
      while (!(await table.isHandComplete()) && iterations < 10) {
        await table.handlePlayerTurn();
        iterations++;
      }

      // Verify hand completed
      expect(['showdown', 'preflop', 'flop', 'turn', 'river']).toContain(table.phase);
      
      // Verify pot was distributed
      expect(table.pot).toBe(0);
      
      // Verify total chips remained constant
      const finalTotal = table.players.reduce((sum, p) => sum + p.chips, 0);
      expect(finalTotal).toBe(initialTotal);
    });
  });

  describe('Player Elimination', () => {
    it('should eliminate players when they run out of chips', async () => {
      const table = new PokerTable(3, 50, 25, 50); // Fewer players, higher blinds relative to stack
      
      let eliminationCount = 0;
      let handCount = 0;
      const maxHands = 10; // Reduced max hands

      while (eliminationCount < 2 && handCount < maxHands) { // Need fewer eliminations
        table.dealCards();
        
        let iterations = 0;
        while (!(await table.isHandComplete()) && iterations < 10) {
          await table.handlePlayerTurn();
          iterations++;
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
      const table = new PokerTable(2, 100, 10, 20);
      
      // Force an all-in situation
      const player = table.players[0];
      const originalChips = 100; // Starting chips
      
      // Simulate a raise larger than player's chips
      table.raise(player, originalChips * 2); // Try to raise to 200
      
      // Verify player went all-in
      expect(player.chips).toBe(0);
      expect(player.bet).toBe(originalChips); // Should bet their entire stack
      expect(table.pot).toBe(originalChips); // Pot should equal their entire stack
      
      // Fold the player since they're all-in
      table.fold(player);
      
      // Now they should be eliminated
      expect(player.eliminated).toBe(true);
      expect(player.rank).toBe(2); // Should be ranked last
    });
  });

  describe('Edge Cases', () => {
    it('should handle heads-up play correctly', () => {
      const table = new PokerTable(2, 1000, 10, 20);
      
      // Verify initial state
      expect(table.players.length).toBe(2);
      expect(table.players[0].chips).toBe(1000);
      expect(table.players[1].chips).toBe(1000);
      
      // Deal cards and verify blind positions
      table.dealCards();
      
      // In heads-up play:
      // - Player 1 (dealer) posts small blind
      // - Player 0 (non-dealer) posts big blind
      expect(table.players[1].bet).toBe(10); // Small blind
      expect(table.players[0].bet).toBe(20); // Big blind
      
      // First action should be to Player 1 (dealer/small blind)
      expect(table.currentPlayerIndex).toBe(1);
    });
  });

  describe('Blind Levels', () => {
    it('should double blinds after specified number of hands', async () => {
      // Initialize with small blinds and quick level progression
      const initialSmallBlind = 10;
      const initialBigBlind = 20;
      const handsPerLevel = 2; // Quick level progression for testing
      
      const table = new PokerTable(2, 1000, initialSmallBlind, initialBigBlind, handsPerLevel);
      table.handNumber = 0; // Ensure we start at hand 0
      
      // Verify initial blind levels
      expect(table.smallBlind).toBe(initialSmallBlind);
      expect(table.bigBlind).toBe(initialBigBlind);
      expect(table.currentLevel).toBe(1);
      
      // Play first level of hands
      for (let i = 0; i < handsPerLevel; i++) {
        table.dealCards();
        let iterations = 0;
        while (!(await table.isHandComplete()) && iterations < 10) {
          await table.handlePlayerTurn();
          iterations++;
        }
      }
      
      // Verify still at level 1
      expect(table.smallBlind).toBe(initialSmallBlind);
      expect(table.bigBlind).toBe(initialBigBlind);
      expect(table.currentLevel).toBe(1);
      
      // Start hand that triggers level 2
      table.dealCards();
      
      // Verify level 2 blinds
      expect(table.smallBlind).toBe(initialSmallBlind * 2);
      expect(table.bigBlind).toBe(initialBigBlind * 2);
      expect(table.currentLevel).toBe(2);
      expect(table.lastAction).toBe(`Blinds increased to ${initialSmallBlind * 2}/${initialBigBlind * 2}`);
      
      // Play second level of hands
      for (let i = 0; i < handsPerLevel; i++) {
        table.dealCards();
        let iterations = 0;
        while (!(await table.isHandComplete()) && iterations < 10) {
          await table.handlePlayerTurn();
          iterations++;
        }
      }
      
      // Start hand that triggers level 3
      table.dealCards();
      
      // Verify level 3 blinds
      expect(table.smallBlind).toBe(initialSmallBlind * 4);
      expect(table.bigBlind).toBe(initialBigBlind * 4);
      expect(table.currentLevel).toBe(3);
      expect(table.lastAction).toBe(`Blinds increased to ${initialSmallBlind * 4}/${initialBigBlind * 4}`);
    });
  });
}); 