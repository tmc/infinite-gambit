import { Agent } from './Agent';

export class DeepseekAgent implements Agent {
  name = 'Deepseek';
  logo = '/logos/deepseek.svg';

  async generateResponse(prompt: string, temperature = 0.7): Promise<string> {
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat-67b-optim',
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: 150,
          top_p: 0.95,
          frequency_penalty: 0.3,
          presence_penalty: 0.3,
          stop: ["\n\n"] // Keep responses focused
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Deepseek API error: ${error.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Deepseek API error:', error);
      // Fallback to a simpler response in case of API issues
      return this.getFallbackResponse(prompt);
    }
  }

  private getFallbackResponse(prompt: string): string {
    const promptLower = prompt.toLowerCase();
    if (promptLower.includes('fold')) return "Based on the game theory optimal play, I fold.";
    if (promptLower.includes('raise')) return "The expected value calculation suggests a raise.";
    return "Calling is the balanced play here.";
  }
} 