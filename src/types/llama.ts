import { ImageSource } from 'expo-image';

type LlamaImageSource = ReturnType<typeof require> & (number | ImageSource);

export type TimerPhase = 'work' | 'shortBreak' | 'longBreak';

export type LlamaVoice = 'warm' | 'sassy' | 'stoic' | 'silly';

export type UnlockCondition =
  | { type: 'starter' }
  | { type: 'sessions'; count: number }
  | { type: 'streak'; days: number }
  | { type: 'paid' };

export interface LlamaPersonality {
  voice: LlamaVoice;
  lines: {
    greeting: string[];
    completion: string[];
    streakBreak: string[];
  };
}

export interface LlamaArt {
  focus: LlamaImageSource;
  break: LlamaImageSource;
  idle: LlamaImageSource;
}

export interface Llama {
  id: string;
  name: string;
  tier: 'starter' | 'earnable' | 'paid';
  unlockCondition: UnlockCondition;
  art: LlamaArt;
  personality: LlamaPersonality;
}
