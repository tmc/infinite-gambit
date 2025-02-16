import { Agent } from './Agent';

export class AnthropicAgent implements Agent {
  name = 'Anthropic';
  logo = '/logos/anthropic.svg';

  async generateResponse(prompt: string, temperature = 0.7): Promise<string> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2024-02-01'
        },
        body: JSON.stringify({
          model: 'claude-3.5-sonnet-latest',
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: 150,
          system: "You are an expert poker player. Keep responses concise and focused on the current game situation.",
          metadata: {
            purpose: "poker_game_decision"
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Anthropic API error:', error);
      // Fallback to a simpler response in case of API issues
      return this.getFallbackResponse(prompt);
    }
  }

  private getFallbackResponse(prompt: string): string {
    const promptLower = prompt.toLowerCase();
    if (promptLower.includes('fold')) return "After careful analysis, I should fold.";
    if (promptLower.includes('raise')) return "The odds favor a raise in this position.";
    return "A call seems mathematically sound here.";
  }
} 