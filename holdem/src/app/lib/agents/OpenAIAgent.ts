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
          model: 'gpt-4-turbo-preview',
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: 150
        })
      });

      if (!response.ok) throw new Error('OpenAI API error');
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }
} 