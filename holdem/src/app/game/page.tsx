'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Tournament from '../components/Tournament';
import { createPayment } from '../../lib/main';

type GameSettings = {
  playerCount: number;
  startingChips: number;
  blinds: {
    small: number;
    big: number;
  };
};

export default function Game() {
  const router = useRouter();
  const [settings, setSettings] = useState<GameSettings | null>(null);

  useEffect(() => {
    // Load game settings from localStorage
    const savedSettings = localStorage.getItem('gameSettings');
    if (!savedSettings) {
      router.push('/new-game');
      return;
    }
    setSettings(JSON.parse(savedSettings));
  }, [router]);

  if (!settings) {
    return <div className="min-h-screen p-8">Loading game settings...</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="h-16 bg-gray-100 dark:bg-gray-800">
        <div className="h-full flex justify-between items-center max-w-7xl mx-auto px-4">
          <h1 className="text-xl font-bold">Poker Tournament</h1>
          <div className="flex items-center">
            <div className="text-sm mr-4">
              <span className="mr-4">Players: {settings.playerCount}</span>
              <span className="mr-4">Starting Chips: {settings.startingChips}</span>
              <span>Blinds: {settings.blinds.small}/{settings.blinds.big}</span>
            </div>
            <button 
              onClick={() => createPayment([1, 3, 2])}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Payout
            </button>
          </div>
        </div>
      </div>
      
      <Tournament settings={settings} />
    </div>
  );
} 