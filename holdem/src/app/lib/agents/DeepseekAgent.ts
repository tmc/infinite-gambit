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
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: 150
        })
      });

      if (!response.ok) throw new Error('Deepseek API error');
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Deepseek API error:', error);
      throw error;
    }
  }
} 