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

export function TechniqueCard({ technique, onSelect }: TechniqueCardProps) {
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
      </div>
    </button>
  );
}