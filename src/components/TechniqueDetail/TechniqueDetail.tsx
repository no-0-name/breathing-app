// src/components/TechniqueDetail/TechniqueDetail.tsx
import './TechniqueDetail.css';
import type { BreathingTechnique } from '../../types/breathing.types';
import { getLevelColor, getLevelLabel } from '../../data/levels';
import { Badge } from '../Badge/Badge';
import { ScreenHeader } from '../ScreenHeader/ScreenHeader';
import { PlayIcon, RepeatIcon } from '../IconButton/icons';

interface TechniqueDetailProps {
  technique: BreathingTechnique;
  onStart: () => void;
  onGoHome: () => void;
}

export function TechniqueDetail({ technique, onStart, onGoHome }: TechniqueDetailProps) {
  return (
    <div className="technique-detail" style={{ ['--accent' as string]: getLevelColor(technique.level) }}>
      <ScreenHeader title={technique.title} onGoHome={onGoHome} />

      <div className="technique-detail__intro">
        <span className="technique-detail__intro-bar" aria-hidden="true" />
        <p className="technique-detail__description">{technique.fullDescription}</p>
      </div>

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
        {/* Вертикальная линия связывает фазы в единый ритм вдоха и выдоха —
            это не декорация: фазы действительно идут друг за другом по кругу. */}
        <ol className="technique-detail__phase-list">
          {technique.phases.map((phase, index) => (
            <li key={index} className="technique-detail__phase">
              <span className="technique-detail__phase-marker" aria-hidden="true">
                <span className="technique-detail__phase-dot" />
              </span>
              <div className="technique-detail__phase-content">
                <div className="technique-detail__phase-top">
                  <p className="technique-detail__phase-label">{phase.label}</p>
                  <span className="technique-detail__phase-duration">{phase.durationSec} с</span>
                </div>
                <p className="technique-detail__phase-hint">{phase.hint}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="technique-detail__footer">
        <div className="technique-detail__cycles">
          <RepeatIcon />
          <span>Рекомендуемая длительность: {technique.recommendedCycles} циклов</span>
        </div>

        <button className="technique-detail__start-button" onClick={onStart} type="button">
          <PlayIcon />
          Начать практику
        </button>
      </div>
    </div>
  );
}
