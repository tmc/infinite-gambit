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
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: 150
        })
      });

      if (!response.ok) throw new Error('Anthropic API error');
      
      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw error;
    }
  }
} 