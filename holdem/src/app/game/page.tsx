'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Tournament from '../components/Tournament';

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
          <h1 className="text-xl font-bold">Infinite Gambit</h1>
          <div className="text-sm">
            <span className="mr-4">Players: {settings.playerCount}</span>
            <span className="mr-4">Starting Chips: {settings.startingChips}</span>
            <span>Blinds: {settings.blinds.small}/{settings.blinds.big}</span>
          </div>
        </div>
      </div>
      
      <Tournament settings={settings} />
    </div>
  );
} 
