import { Llama, LlamaPersonality, LlamaVoice } from '@/types/llama';

const placeholderArt: Llama['art'] = {
  focus: require('@/assets/images/llama-placeholder.png') as Llama['art']['focus'],
  break: require('@/assets/images/llama-placeholder.png') as Llama['art']['break'],
  idle: require('@/assets/images/llama-placeholder.png') as Llama['art']['idle'],
};

const minimalLines = (name: string, voice: LlamaVoice): LlamaPersonality => ({
  voice,
  lines: {
    greeting: [`${name} is ready.`],
    completion: [`${name} says nice focus.`],
    streakBreak: [`${name} says tomorrow is open.`],
  },
});

export const LLAMAS: Llama[] = [
  {
    id: 'pedro',
    name: 'Pedro',
    tier: 'starter',
    unlockCondition: { type: 'starter' },
    art: {
      focus: require('@/assets/llamas/pedro-focus.png') as Llama['art']['focus'],
      break: require('@/assets/llamas/pedro-break.png') as Llama['art']['break'],
      idle: require('@/assets/llamas/pedro-idle.png') as Llama['art']['idle'],
    },
    personality: {
      voice: 'warm',
      lines: {
        greeting: [
          'Pedro packed snacks and belief.',
          'Tiny steps. Big llama energy.',
          'Pedro says your focus has excellent posture.',
        ],
        completion: [
          'Pedro saw that. Very dignified.',
          'Focus session complete. Pedro recommends a stretch.',
          'That was clean work. Pedro is quietly thrilled.',
        ],
        streakBreak: [
          'Pedro saved your seat for today.',
          'A missed day is just compost for the next one.',
          'Pedro says begin again, gently.',
        ],
      },
    },
  },
  {
    id: 'beatrix',
    name: 'Beatrix',
    tier: 'starter',
    unlockCondition: { type: 'starter' },
    art: {
      focus: require('@/assets/llamas/beatrix-focus.png') as Llama['art']['focus'],
      break: require('@/assets/llamas/beatrix-break.png') as Llama['art']['break'],
      idle: require('@/assets/llamas/beatrix-idle.png') as Llama['art']['idle'],
    },
    personality: {
      voice: 'sassy',
      lines: {
        greeting: [
          'Beatrix expects excellence, obviously.',
          'Try to keep up with the llama.',
          'Beatrix has cleared her schedule for your productivity.',
        ],
        completion: [
          'Fine. That was impressive.',
          'Beatrix will allow one victory sip.',
          'Competence detected. Mark the calendar.',
        ],
        streakBreak: [
          'Beatrix noticed, but she is choosing grace.',
          'The streak tripped. Pick it up.',
          'Drama over. Back to work.',
        ],
      },
    },
  },
  {
    id: 'coco',
    name: 'Coco',
    tier: 'starter',
    unlockCondition: { type: 'starter' },
    art: placeholderArt,
    personality: minimalLines('Coco', 'silly'),
  },
  {
    id: 'rio',
    name: 'Rio',
    tier: 'starter',
    unlockCondition: { type: 'starter' },
    art: placeholderArt,
    personality: minimalLines('Rio', 'stoic'),
  },
  {
    id: 'sol',
    name: 'Sol',
    tier: 'starter',
    unlockCondition: { type: 'starter' },
    art: placeholderArt,
    personality: minimalLines('Sol', 'warm'),
  },
  {
    id: 'luna',
    name: 'Luna',
    tier: 'earnable',
    unlockCondition: { type: 'sessions', count: 10 },
    art: placeholderArt,
    personality: minimalLines('Luna', 'warm'),
  },
  {
    id: 'nova',
    name: 'Nova',
    tier: 'earnable',
    unlockCondition: { type: 'sessions', count: 50 },
    art: placeholderArt,
    personality: minimalLines('Nova', 'sassy'),
  },
  {
    id: 'sage',
    name: 'Sage',
    tier: 'earnable',
    unlockCondition: { type: 'sessions', count: 200 },
    art: placeholderArt,
    personality: minimalLines('Sage', 'stoic'),
  },
  {
    id: 'blaze',
    name: 'Blaze',
    tier: 'earnable',
    unlockCondition: { type: 'streak', days: 7 },
    art: placeholderArt,
    personality: minimalLines('Blaze', 'silly'),
  },
  {
    id: 'zuri',
    name: 'Zuri',
    tier: 'earnable',
    unlockCondition: { type: 'streak', days: 30 },
    art: placeholderArt,
    personality: minimalLines('Zuri', 'warm'),
  },
  ...[
    'Mochi',
    'Pip',
    'Tango',
    'Mabel',
    'Fig',
    'Juno',
    'Kiki',
    'Otis',
    'Poppy',
    'Quill',
    'Rafa',
    'Skye',
    'Tula',
    'Uma',
    'Vega',
    'Wren',
    'Yara',
    'Basil',
    'Clover',
    'Dottie',
    'Echo',
    'Fable',
    'Gigi',
    'Hazel',
    'Indigo',
    'Jasper',
    'Kiwi',
    'Miso',
    'Nori',
    'Olive',
    'Peach',
    'Quartz',
    'Rumi',
    'Suki',
    'Toast',
  ].map((name, index): Llama => ({
    id: name.toLowerCase(),
    name,
    tier: 'paid',
    unlockCondition: { type: 'paid' },
    art: placeholderArt,
    personality: minimalLines(name, (['warm', 'sassy', 'stoic', 'silly'] as const)[index % 4]),
  })),
];

export function getLlamaById(id: string): Llama {
  return LLAMAS.find((llama) => llama.id === id) ?? LLAMAS[0];
}
