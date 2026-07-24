import type { TechniqueLevel } from '../types/breathing.types';

/** Human-readable Russian label for each difficulty level. */
const LEVEL_LABELS: Record<TechniqueLevel, string> = {
  beginner: 'Для начинающих',
  intermediate: 'Средний уровень',
  advanced: 'Продвинутый',
};

/**
 * Each difficulty level owns exactly one accent color, shared by every
 * technique at that level. This makes color mean something at a glance
 * (level) instead of being an arbitrary per-technique choice.
 */
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
