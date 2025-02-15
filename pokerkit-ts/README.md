# PokerKit TypeScript

A TypeScript library for poker game logic and analysis, inspired by the original PokerKit implementation.

## Features

- Card and deck management with support for various poker variants
- Hand evaluation and comparison
- Game state management
- Support for different betting structures (Fixed-limit, Pot-limit, No-limit)
- Support for different poker variants (Texas Hold'em, Short Deck, etc.)

## Installation

```bash
npm install pokerkit-ts
```

## Basic Usage

### Creating and Managing Cards

```typescript
import { Card, Rank, Suit } from 'pokerkit-ts';

// Create a card
const aceOfSpades = new Card(Rank.ACE, Suit.SPADE);

// Create from string
const kingOfHearts = Card.fromString('Kh');
```

### Working with Decks

```typescript
import { Deck } from 'pokerkit-ts';

// Create a standard 52-card deck
const deck = Deck.createStandard();

// Create a short-deck (36-card) deck
const shortDeck = Deck.createShortDeckHoldem();

// Shuffle and draw
deck.shuffle();
const drawnCard = deck.draw();
```

### Hand Evaluation

```typescript
import { StandardHand } from 'pokerkit-ts';

// Create and evaluate a poker hand
const hand = new StandardHand(['As', 'Ks', 'Qs', 'Js', 'Ts']);
console.log(hand.toString()); // "Straight flush: As Ks Qs Js Ts"
```

### Game State Management

```typescript
import { 
  GameStateManager, 
  GameConfig, 
  BettingStructure, 
  GameMode 
} from 'pokerkit-ts';

// Configure a game
const config: GameConfig = {
  betting_structure: BettingStructure.NO_LIMIT,
  mode: GameMode.TOURNAMENT,
  starting_stacks: [1000, 1000, 1000],
  player_count: 3,
  // ... other configuration options
};

// Create a game manager
const game = new GameStateManager(config);

// Apply actions
game.applyAction({
  type: 'bet',
  player_index: 0,
  amount: 100
});
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License 