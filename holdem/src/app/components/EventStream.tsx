'use client';

import { useState, useEffect } from 'react';

type Event = {
  timestamp: string;
  message: string;
  type: 'action' | 'agent' | 'system';
};

type EventStreamProps = {
  gameState: any;
  className?: string;
};

export default function EventStream({ gameState, className = '' }: EventStreamProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [agentMessage, setAgentMessage] = useState('');

  // Add new events when game state changes
  useEffect(() => {
    if (!gameState) return;

    const newEvents: Event[] = [
      {
        timestamp: new Date().toLocaleTimeString(),
        message: gameState.lastAction || 'Game state updated',
        type: 'action'
      }
    ];

    // Add agent commentary for interesting events
    if (gameState.phase === 'showdown') {
      newEvents.push({
        timestamp: new Date().toLocaleTimeString(),
        message: "Let's see who has the winning hand!",
        type: 'agent'
      });
    } else if (gameState.pot > 100) {
      newEvents.push({
        timestamp: new Date().toLocaleTimeString(),
        message: "The pot is getting big - this is an exciting hand!",
        type: 'agent'
      });
    } else if (gameState.lastAction?.includes('raises')) {
      newEvents.push({
        timestamp: new Date().toLocaleTimeString(),
        message: "Ooh, someone's feeling confident!",
        type: 'agent'
      });
    }

    setEvents(prev => [...prev, ...newEvents].slice(-50)); // Keep last 50 events
  }, [gameState]);

  const handleAgentMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentMessage.trim()) return;

    const newEvent: Event = {
      timestamp: new Date().toLocaleTimeString(),
      message: agentMessage,
      type: 'agent'
    };

    setEvents(prev => [...prev, newEvent]);
    setAgentMessage('');
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex-1 overflow-y-auto bg-gray-900 rounded-lg p-4 mb-4 border border-cyan-900">
        <div className="space-y-2">
          {events.map((event, i) => (
            <div
              key={i}
              className={`p-2 rounded border ${
                event.type === 'action' 
                  ? 'bg-gray-800 border-blue-900 text-blue-300' 
                  : event.type === 'agent'
                  ? 'bg-gray-800 border-green-900 text-green-300'
                  : 'bg-gray-800 border-gray-700 text-gray-300'
              }`}
            >
              <div className="text-xs text-gray-500">
                {event.timestamp}
              </div>
              <div className={`text-sm ${
                event.type === 'agent' ? 'text-green-400' : 'text-cyan-400'
              }`}>
                {event.type === 'agent' && '🤖 '}
                {event.message}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleAgentMessage} className="flex gap-2">
        <input
          type="text"
          value={agentMessage}
          onChange={(e) => setAgentMessage(e.target.value)}
          placeholder="Enter agent message..."
          className="flex-1 px-3 py-2 bg-gray-800 border border-cyan-900 rounded-md text-cyan-100 placeholder-cyan-700"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-cyan-900 text-cyan-100 rounded-md hover:bg-cyan-800 transition-colors border border-cyan-700"
        >
          Send
        </button>
      </form>
    </div>
  );
} 