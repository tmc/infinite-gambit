
export type Player = {
  id: string;
  name: string;
  chips: number;
  hand: string[];
  bet: number;
  folded: boolean;
  eliminated: boolean;
  personality: {
    style: 'aggressive' | 'conservative' | 'balanced' | 'unpredictable';
    description: string;
  };
};

export type GameState = {
  players: Player[];
  pot: number;
  communityCards: string[];
  currentBet: number;
  currentPlayer: number;
  phase: string;
  lastAction?: string;
  dealerPosition: number;
  isDealing: boolean;
  stepIndex: number;
};

export type ChipAnimation = {
  fromId: string;
  toId?: string;
  amount: number;
  timestamp: number;
  type: 'bet' | 'collect';
};
