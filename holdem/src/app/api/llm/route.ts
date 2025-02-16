import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, temperature = 0.7, maxTokens = 50 } = await req.json();

    // For now, return a simple response without actual LLM integration
    const defaultResponses = {
      fold: "I've seen enough. Time to live to fight another day.",
      call: "Let's see what you've got. I'm in.",
      raise: "Time to put the pressure on. I'm raising the stakes."
    };

    // Simple logic to determine response based on prompt content
    let text = "Interesting play.";
    if (prompt.toLowerCase().includes('fold')) {
      text = defaultResponses.fold;
    } else if (prompt.toLowerCase().includes('call')) {
      text = defaultResponses.call;
    } else if (prompt.toLowerCase().includes('raise')) {
      text = defaultResponses.raise;
    }

    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('LLM API error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 