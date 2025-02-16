/* global describe, it, expect */

declare const describe: any;
declare const it: any;
declare const expect: any;

import { runTournament, TournamentSettings, TournamentEvent } from './GameLoop';

describe('runTournament', () => {
  // Ultra-aggressive timeout
  jest.setTimeout(1000);

  it('should quickly complete with very low starting chips', async () => {
    const settings: TournamentSettings = {
      playerCount: 2,
      startingChips: 1,
      blinds: {
        small: 1,
        big: 2
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

  it('should properly handle a full tournament with realistic chip counts', async () => {
    const bigBlind = 20;
    const settings: TournamentSettings = {
      playerCount: 4, // Good size for quick testing
      startingChips: bigBlind * 50, // 1000 chips
      blinds: {
        small: bigBlind / 2,
        big: bigBlind
      },
      handsPerLevel: 3 // Fast blind increases
    };

    const events: TournamentEvent[] = [];
    await runTournament(settings, (event: TournamentEvent) => {
      events.push(event);
    });

    // Verify tournament completion
    const completeEvent = events.find(e => e.type === 'tournamentComplete');
    expect(completeEvent).toBeDefined();
    
    // Verify final tournament state
    const players = completeEvent?.data.players;
    const eliminatedPlayers = players.filter((p: any) => p.eliminated);
    const nonEliminatedPlayers = players.filter((p: any) => !p.eliminated);
    
    // Verify correct number of eliminations
    expect(eliminatedPlayers.length).toBe(settings.playerCount - 1); // All but winner eliminated
    expect(nonEliminatedPlayers.length).toBe(1); // Exactly one winner
    
    // Verify winner has all the chips
    const winner = nonEliminatedPlayers[0];
    expect(winner.chips).toBe(settings.playerCount * settings.startingChips);
    
    // Verify elimination order (ranks should be sequential)
    const ranks = eliminatedPlayers.map((p: any) => p.rank).sort();
    for (let i = 0; i < ranks.length; i++) {
      expect(ranks[i]).toBe(i + 2); // Winner is rank 1, eliminated start at 2
    }
    
    // Verify player statistics
    players.forEach((player: any) => {
      expect(player.handsPlayed).toBeGreaterThan(0);
      expect(player.totalBets).toBeGreaterThan(0);
      if (!player.eliminated) {
        expect(player.handsWon).toBeGreaterThan(0);
      }
    });

    // Verify tournament progression through player stats
    const totalHandsPlayed = Math.max(...players.map((p: any) => p.handsPlayed));
    expect(totalHandsPlayed).toBeGreaterThan(settings.handsPerLevel); // At least one blind level completed
    
    // Verify reasonable betting activity
    const totalBetsSum = players.reduce((sum: number, p: any) => sum + p.totalBets, 0);
    expect(totalBetsSum).toBeGreaterThan(settings.playerCount * settings.blinds.big * totalHandsPlayed);
    
    // Verify some players won multiple hands
    const multiHandWinners = players.filter((p: any) => p.handsWon > 1);
    expect(multiHandWinners.length).toBeGreaterThan(0);
    
    // Verify biggest pots indicate significant betting
    const maxPot = Math.max(...players.map((p: any) => p.biggestPot));
    expect(maxPot).toBeGreaterThan(settings.blinds.big * 2);
  });
}); 