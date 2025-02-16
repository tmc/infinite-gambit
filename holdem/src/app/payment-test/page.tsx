'use client';

import { useState } from 'react';
import { createPayment } from '@/lib/main';

export default function PaymentTestPage() {
  const [positions, setPositions] = useState<[number, number, number]>([1, 2, 3]);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payments = await createPayment(positions);
      setResult(JSON.stringify(payments, null, 2));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResult('');
    }
  };

  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Payment Test</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((index) => (
              <div key={index}>
                <label className="block text-sm font-medium mb-2">
                  Position {index + 1}
                </label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={positions[index]}
                  onChange={(e) => {
                    const newPositions = [...positions];
                    newPositions[index] = Number(e.target.value);
                    setPositions(newPositions as [number, number, number]);
                  }}
                  className="w-full px-3 py-2 border rounded-md bg-transparent"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-cyan-600 text-white py-3 px-6 rounded-md hover:bg-cyan-700 transition-colors font-medium"
          >
            Test Payment
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-md text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Payment Result:</h2>
            <pre className="p-4 bg-gray-800 text-green-400 rounded-md overflow-x-auto">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 