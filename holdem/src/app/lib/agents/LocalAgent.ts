import { Agent } from './Agent';

export class LocalAgent implements Agent {
  name = 'Local AI';
  logo = '/logos/robot.svg';

  async generateResponse(prompt: string): Promise<string> {
    // Simple rule-based responses
    const defaultResponses = {
      fold: [
        "I've seen enough. Time to live to fight another day.",
        "These cards aren't worth the risk.",
        "Sometimes you have to know when to back down."
      ],
      call: [
        "Let's see what you've got. I'm in.",
        "I'll match that bet.",
        "Seems like a reasonable spot to call."
      ],
      raise: [
        "Time to put the pressure on. I'm raising the stakes.",
        "Let's make this pot interesting.",
        "My hand deserves a raise here."
      ]
    };

    const promptLower = prompt.toLowerCase();
    let responses;
    
    if (promptLower.includes('fold')) {
      responses = defaultResponses.fold;
    } else if (promptLower.includes('raise')) {
      responses = defaultResponses.raise;
    } else {
      responses = defaultResponses.call;
    }

    return responses[Math.floor(Math.random() * responses.length)];
  }
} 