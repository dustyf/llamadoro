import { Llama } from '@/types/llama';

export type PersonalityLineCategory = keyof Llama['personality']['lines'];

export function pickLine(llama: Llama, category: PersonalityLineCategory): string {
  const lines = llama.personality.lines[category];
  if (!lines.length) return '';
  return lines[Math.floor(Math.random() * lines.length)] ?? '';
}
