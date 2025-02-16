/* global describe, it, expect */

declare const describe: any;
declare const it: any;
declare const expect: any;

import { runTournament, TournamentSettings, TournamentEvent } from './GameLoop';

// Jest test for the runTournament function

describe('runTournament', () => {
  // Increase timeout for all tests in this describe block
  jest.setTimeout(120000);

  it('should quickly complete with very low starting chips', async () => {
    const settings: TournamentSettings = {
      playerCount: 2,
      startingChips: 5, // low chips to force quick elimination
      blinds: {
        small: 10,
        big: 20
      },
      handsPerLevel: 1
    };

    const events: TournamentEvent[] = [];
    await runTournament(settings, (event: TournamentEvent) => {
      events.push(event);
    });

    const completeEvent = events.find(e => e.type === 'tournamentComplete');
    expect(completeEvent).toBeDefined();
    expect(completeEvent?.data.players).toBeDefined();
    expect(Array.isArray(completeEvent?.data.players)).toBe(true);
  });

  it('should properly handle a tournament with realistic chip counts', async () => {
    const bigBlind = 20;
    const settings: TournamentSettings = {
      playerCount: 4,
      startingChips: bigBlind * 100, // 2000 chips = 100x big blind
      blinds: {
        small: bigBlind / 2,
        big: bigBlind
      },
      handsPerLevel: 10
    };

    const events: TournamentEvent[] = [];
    await runTournament(settings, (event: TournamentEvent) => {
      events.push(event);
    });

    // Verify tournament completion
    const completeEvent = events.find(e => e.type === 'tournamentComplete');
    expect(completeEvent).toBeDefined();
    
    // Check that we had multiple gameState events (indicating multiple hands were played)
    const gameStateEvents = events.filter(e => e.type === 'gameState');
    expect(gameStateEvents.length).toBeGreaterThan(10); // Should have many game states
    
    // Verify blind levels increased at least once
    const finalGameState = gameStateEvents[gameStateEvents.length - 1].data;
    expect(finalGameState.currentLevel).toBeGreaterThan(1);
    
    // Verify winner has all the chips
    const players = completeEvent?.data.players;
    const nonEliminatedPlayers = players.filter((p: any) => !p.eliminated);
    expect(nonEliminatedPlayers.length).toBe(1); // Should be exactly one winner
    
    // Winner should have all the chips (total = playerCount * startingChips)
    const winner = nonEliminatedPlayers[0];
    expect(winner.chips).toBe(settings.playerCount * settings.startingChips);
  });
}); 