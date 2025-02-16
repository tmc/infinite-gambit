import { Agent } from './Agent';

export class OpenAIAgent implements Agent {
  name = 'OpenAI';
  logo = '/logos/openai.svg';

  async generateResponse(prompt: string, temperature = 0.7): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini-2024-07-18',
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: 150,
          response_format: { type: "text" },
          seed: 42, // For more consistent responses
          frequency_penalty: 0.3, // Reduce repetition
          presence_penalty: 0.3 // Encourage focused responses
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to a simpler response in case of API issues
      return this.getFallbackResponse(prompt);
    }
  }

  private getFallbackResponse(prompt: string): string {
    const promptLower = prompt.toLowerCase();
    if (promptLower.includes('fold')) return "I think I should fold here.";
    if (promptLower.includes('raise')) return "This looks like a good spot to raise.";
    return "I'll call and see what happens.";
  }
} 