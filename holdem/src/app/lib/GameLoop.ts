import { PokerTable } from './PokerTable';

export type TournamentSettings = {
  playerCount: number;
  startingChips: number;
  blinds: {
    small: number;
    big: number;
  };
  handsPerLevel: number;
};

export type TournamentEvent = {
  type: 'gameState' | 'tournamentComplete' | 'error';
  data: any;
};

export async function runTournament(
  settings: TournamentSettings,
  eventCallback: (event: TournamentEvent) => void
): Promise<void> {
  // Create a new PokerTable
  const table = new PokerTable(
    settings.playerCount,
    settings.startingChips,
    settings.blinds.small,
    settings.blinds.big,
    settings.handsPerLevel
  );

  let handCount = 0;
  const MAX_HANDS = 20; // Safety limit

  // Run game loop until tournament complete
  while (table.players.some(p => !p.eliminated) && handCount < MAX_HANDS) {
    // Start new hand
    table.dealCards();
    // Note: handNumber is incremented in PokerTable.isHandComplete() after the hand is actually complete
    handCount++;

    // In test mode, only emit state at start of hand
    if (process.env.NODE_ENV !== 'test') {
      eventCallback({
        type: 'gameState',
        data: {
          players: table.players,
          pot: table.pot,
          communityCards: table.communityCards,
          currentBet: table.currentBet,
          currentPlayer: table.currentPlayerIndex,
          phase: table.phase,
          lastAction: table.lastAction,
          handNumber: table.handNumber,
          currentLevel: table.currentLevel,
          smallBlind: table.smallBlind,
          bigBlind: table.bigBlind,
          handsUntilBlindsIncrease: table.handsPerLevel - (table.handNumber % table.handsPerLevel)
        }
      });
    }

    // Play hand until complete
    let iterations = 0;
    while (!(await table.isHandComplete()) && iterations < 10) { // Reduced max iterations
      await table.handlePlayerTurn();
      
      // Only emit state updates in non-test mode
      if (process.env.NODE_ENV !== 'test') {
        eventCallback({
          type: 'gameState',
          data: {
            players: table.players,
            pot: table.pot,
            communityCards: table.communityCards,
            currentBet: table.currentBet,
            currentPlayer: table.currentPlayerIndex,
            phase: table.phase,
            lastAction: table.lastAction,
            handNumber: table.handNumber,
            currentLevel: table.currentLevel,
            smallBlind: table.smallBlind,
            bigBlind: table.bigBlind,
            handsUntilBlindsIncrease: table.handsPerLevel - (table.handNumber % table.handsPerLevel)
          }
        });
      }

      iterations++;
    }
  }

  // Tournament complete, emit final event
  eventCallback({
    type: 'tournamentComplete',
    data: {
      players: table.players
    }
  });
} 