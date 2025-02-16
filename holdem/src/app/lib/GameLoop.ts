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

  // Run game loop until tournament complete
  while (table.players.some(p => !p.eliminated)) {
    // Start new hand
    table.dealCards();
    table.handNumber++; // Increment hand number at start of each hand

    // Emit initial state
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

    // Play hand until complete
    while (!(await table.isHandComplete())) {
      await table.handlePlayerTurn();
      
      // Emit updated state after each turn
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

      // Small delay between turns to prevent overwhelming the event system
      await new Promise(resolve => setTimeout(resolve, 50));
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