export interface Agent {
  name: string;
  logo: string;
  generateResponse(prompt: string, temperature?: number): Promise<string>;
}

export type AgentType = 'openai' | 'anthropic' | 'deepseek' | 'local';

export const getAgentLogo = (type: AgentType): string => {
  const logos = {
    openai: '/logos/openai.svg',
    anthropic: '/logos/anthropic.svg',
    deepseek: '/logos/deepseek.svg',
    local: '/logos/robot.svg'
  };
  return logos[type];
}; 