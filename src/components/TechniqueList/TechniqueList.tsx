import './TechniqueList.css';
import type { BreathingTechnique, TechniqueLevel } from '../../types/breathing.types';
import { TechniqueCard } from '../TechniqueCard/TechniqueCard';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import { Achievements } from '../Achievements/Achievements';
import { IconButton } from '../IconButton/IconButton';
import { ProfileIcon } from '../IconButton/icons';
import { useTelegramPayments } from '../../hooks/useTelegramPayments';
import { getLevelLabel } from '../../data/levels';

interface TechniqueListProps {
  techniques: BreathingTechnique[];
  onSelectTechnique: (id: string) => void;
  onNavigateToProfile: () => void;
}

const LEVEL_ORDER: TechniqueLevel[] = ['beginner', 'intermediate', 'advanced'];

export function TechniqueList({ techniques, onSelectTechnique, onNavigateToProfile }: TechniqueListProps) {
  const { isPremium } = useTelegramPayments();

  const groupedTechniques = techniques.reduce((acc, technique) => {
    const level = technique.level;
    if (!acc[level]) acc[level] = [];
    acc[level].push(technique);
    return acc;
  }, {} as Record<TechniqueLevel, BreathingTechnique[]>);

  return (
    <div className="technique-list">
      <header className="technique-list__header">
        <div className="technique-list__header-row">
          <div className="technique-list__header-content">
            <p className="technique-list__eyebrow">Дыхательные практики</p>
            <h1 className="technique-list__title">Выберите технику дыхания</h1>
            <p className="technique-list__subtitle">
              Несколько минут осознанного дыхания помогают снять стресс, успокоиться или сосредоточиться.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <IconButton
              aria-label="Профиль и статистика"
              onClick={onNavigateToProfile}
              variant="ghost"
              style={{ '--icon-button-size': '40px' } as React.CSSProperties}
            >
              <ProfileIcon />
            </IconButton>
            <ThemeToggle className="technique-list__theme-toggle" />
          </div>
        </div>
      </header>

      <Achievements />

      <div className="technique-list__items">
        {LEVEL_ORDER.map((level) => {
          const levelTechniques = groupedTechniques[level] || [];
          if (levelTechniques.length === 0) return null;

          return (
            <div key={level} className="technique-list__category">
              {levelTechniques.map((technique) => {
                if (technique.isPremium && !isPremium) {
                  return (
                    <div key={technique.id} className="technique-card technique-card--locked">
                      <div className="technique-card__body">
                        <h3 className="technique-card__title">{technique.title}</h3>
                        <p className="technique-card__description">{technique.shortDescription}</p>
                        <div className="technique-card__meta">
                          <span className="badge badge--locked">
                            <span className="badge__icon">🔒</span>
                            Премиум
                          </span>
                          <span className="technique-card__phases-count">
                            {technique.phases.length} фаз дыхания
                          </span>
                          <span className="badge badge--level">
                            {getLevelLabel(technique.level)}
                          </span>
                        </div>
                        <button
                          className="technique-card__unlock-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToProfile();
                          }}
                        >
                          <span className="unlock-btn__icon">⭐</span>
                          <span className="unlock-btn__text">Открыть за Stars</span>
                        </button>
                      </div>
                    </div>
                  );
                }
                return (
                  <TechniqueCard
                    key={technique.id}
                    technique={technique}
                    onSelect={onSelectTechnique}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}