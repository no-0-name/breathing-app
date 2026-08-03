import type { TechniqueLevel } from '../types/breathing.types';

const LEVEL_LABELS: Record<TechniqueLevel, string> = {
  beginner: 'Для начинающих',
  intermediate: 'Средний уровень',
  advanced: 'Продвинутый',
};

const LEVEL_COLORS: Record<TechniqueLevel, string> = {
  beginner: '#7DD8C8',
  intermediate: '#9C8CF2',
  advanced: '#F2A48B',
};

export function getLevelLabel(level: TechniqueLevel): string {
  return LEVEL_LABELS[level];
}

export function getLevelColor(level: TechniqueLevel): string {
  return LEVEL_COLORS[level];
}
