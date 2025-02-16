'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewGame() {
  const router = useRouter();
  const [playerCount, setPlayerCount] = useState(6);
  const [startingChips, setStartingChips] = useState(1000);
  const [blinds, setBlinds] = useState({ small: 10, big: 20 });
  const [handsPerLevel, setHandsPerLevel] = useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Store game settings in localStorage
    localStorage.setItem('gameSettings', JSON.stringify({
      playerCount,
      startingChips,
      blinds,
      handsPerLevel,
    }));
    // Navigate to the game page
    router.push('/game');
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">New Poker Tournament</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Number of Players
            </label>
            <input
              type="number"
              min={2}
              max={9}
              value={playerCount}
              onChange={(e) => setPlayerCount(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Starting Chips
            </label>
            <input
              type="number"
              min={100}
              step={100}
              value={startingChips}
              onChange={(e) => setStartingChips(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Small Blind
              </label>
              <input
                type="number"
                min={1}
                value={blinds.small}
                onChange={(e) => setBlinds({ ...blinds, small: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Big Blind
              </label>
              <input
                type="number"
                min={2}
                value={blinds.big}
                onChange={(e) => setBlinds({ ...blinds, big: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Hands Before Blinds Double
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={handsPerLevel}
                onChange={(e) => setHandsPerLevel(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md"
              />
              <span className="text-sm text-gray-500">hands</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Blinds will double every {handsPerLevel} hands to speed up the tournament
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Start Tournament
          </button>
        </form>
      </div>
    </div>
  );
} 