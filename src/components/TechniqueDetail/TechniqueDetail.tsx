// src/components/TechniqueDetail/TechniqueDetail.tsx
import './TechniqueDetail.css';
import type { BreathingTechnique } from '../../types/breathing.types';
import { getLevelColor, getLevelLabel } from '../../data/levels';
import { Badge } from '../Badge/Badge';
import { ScreenHeader } from '../ScreenHeader/ScreenHeader';

interface TechniqueDetailProps {
  technique: BreathingTechnique;
  onStart: () => void;
  onGoHome: () => void;
}

export function TechniqueDetail({ technique, onStart, onGoHome }: TechniqueDetailProps) {
  return (
    <div className="technique-detail" style={{ ['--accent' as string]: getLevelColor(technique.level) }}>
      <ScreenHeader title={technique.title} onGoHome={onGoHome} />

      <p className="technique-detail__description">{technique.fullDescription}</p>

      <div className="technique-detail__benefits">
        <Badge tone="accent">{getLevelLabel(technique.level)}</Badge>
        {technique.benefits.map((benefit) => (
          <Badge key={benefit} tone="neutral">
            {benefit}
          </Badge>
        ))}
      </div>

      <section className="technique-detail__phases">
        <h2 className="technique-detail__section-title">Схема одного цикла</h2>
        <ol className="technique-detail__phase-list">
          {technique.phases.map((phase, index) => (
            <li key={index} className="technique-detail__phase">
              <span className="technique-detail__phase-duration">{phase.durationSec}с</span>
              <div>
                <p className="technique-detail__phase-label">{phase.label}</p>
                <p className="technique-detail__phase-hint">{phase.hint}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <p className="technique-detail__cycles">
        Рекомендуемая длительность сессии: {technique.recommendedCycles} циклов
      </p>

      <button className="technique-detail__start-button" onClick={onStart} type="button">
        Начать практику
      </button>
    </div>
  );
}