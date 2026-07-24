// src/components/TechniqueCard/TechniqueCard.tsx
import './TechniqueCard.css';
import type { BreathingTechnique } from '../../types/breathing.types';
import { getLevelColor, getLevelLabel } from '../../data/levels';
import { pluralizeRu } from '../../utils/pluralize';
import { Badge } from '../Badge/Badge';

interface TechniqueCardProps {
  technique: BreathingTechnique;
  onSelect: (id: string) => void;
  masteryLevel?: number;
}

export function TechniqueCard({ technique, onSelect, masteryLevel = 0 }: TechniqueCardProps) {
  const getMasteryLabel = (level: number) => {
    if (level === 0) return 'Не изучена';
    if (level < 25) return 'Начинающий';
    if (level < 50) return 'Знаком';
    if (level < 75) return 'Уверен';
    if (level < 100) return 'Продвинутый';
    return 'Мастер';
  };

  const getMasteryEmoji = (level: number) => {
    if (level === 0) return '🌱';
    if (level < 25) return '📖';
    if (level < 50) return '🌿';
    if (level < 75) return '🌳';
    if (level < 100) return '🌟';
    return '🧘';
  };

  // Показываем прогресс только если есть хоть какой-то прогресс
  const showMastery = masteryLevel > 0;

  return (
    <button
      className="technique-card"
      style={{ ['--accent' as string]: getLevelColor(technique.level) }}
      onClick={() => onSelect(technique.id)}
      type="button"
    >
      <div className="technique-card__glow" />
      <div className="technique-card__body">
        <h3 className="technique-card__title">{technique.title}</h3>
        <p className="technique-card__description">{technique.shortDescription}</p>
        <div className="technique-card__meta">
          <Badge tone="accent">{getLevelLabel(technique.level)}</Badge>
          <span className="technique-card__phases-count">
            {technique.phases.length} {pluralizeRu(technique.phases.length, ['фаза', 'фазы', 'фаз'])} дыхания
          </span>
        </div>
        
        {/* Прогресс-бар мастерства - показываем только если есть прогресс */}
        {showMastery && (
          <div className="technique-card__mastery">
            <div className="technique-card__mastery-header">
              <span className="technique-card__mastery-icon">
                {getMasteryEmoji(masteryLevel)}
              </span>
              <span className="technique-card__mastery-label">
                {getMasteryLabel(masteryLevel)}
              </span>
              <span className="technique-card__mastery-percent">
                {Math.round(masteryLevel)}%
              </span>
            </div>
            <div className="technique-card__mastery-bar">
              <div 
                className="technique-card__mastery-fill" 
                style={{ 
                  width: `${Math.min(masteryLevel, 100)}%`,
                  background: `linear-gradient(90deg, ${getLevelColor(technique.level)}, ${getLevelColor(technique.level)}cc)`
                }}
              />
            </div>
          </div>
        )}
      </div>
    </button>
  );
}