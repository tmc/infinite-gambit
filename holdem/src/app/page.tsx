'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [playerCount, setPlayerCount] = useState(6);
  const [startingChips, setStartingChips] = useState(1000);
  const [blinds, setBlinds] = useState({ small: 10, big: 20 });
  const [handsPerLevel, setHandsPerLevel] = useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('gameSettings', JSON.stringify({
      playerCount,
      startingChips,
      blinds,
      handsPerLevel,
    }));
    router.push('/game');
  };

  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Infinite Gambit</h1>
        
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
              className="w-full px-3 py-2 border rounded-md bg-transparent"
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
              className="w-full px-3 py-2 border rounded-md bg-transparent"
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
                className="w-full px-3 py-2 border rounded-md bg-transparent"
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
                className="w-full px-3 py-2 border rounded-md bg-transparent"
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
                className="w-full px-3 py-2 border rounded-md bg-transparent"
              />
              <span className="text-sm text-gray-500">hands</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Blinds will double every {handsPerLevel} hands to speed up the tournament
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-600 text-white py-3 px-6 rounded-md hover:bg-cyan-700 transition-colors font-medium"
          >
            Start Tournament
          </button>
        </form>
      </div>
    </div>
  );
}
