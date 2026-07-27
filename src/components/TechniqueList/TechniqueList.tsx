import './TechniqueList.css';
import type { BreathingTechnique, TechniqueLevel } from '../../types/breathing.types';
import { TechniqueCard } from '../TechniqueCard/TechniqueCard';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import { Achievements } from '../Achievements/Achievements';
import { IconButton } from '../IconButton/IconButton';
import { ProfileIcon } from '../IconButton/icons';
import { useStatistics } from '../../hooks/useStatistics';
import { useState, useEffect } from 'react';

interface TechniqueListProps {
  techniques: BreathingTechnique[];
  onSelectTechnique: (id: string) => void;
  onNavigateToProfile: () => void;
}

const LEVEL_ORDER: TechniqueLevel[] = ['beginner', 'intermediate', 'advanced'];

export function TechniqueList({ techniques, onSelectTechnique, onNavigateToProfile }: TechniqueListProps) {
  const { stats } = useStatistics();
  const [masteryLevels, setMasteryLevels] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const mastery: Record<string, number> = {};
      techniques.forEach(tech => {
        const sessions = stats.sessions.filter(s => s.techniqueId === tech.id);
        if (sessions.length === 0) {
          mastery[tech.id] = 0;
        } else {
          const sessionsNeeded = 10;
          mastery[tech.id] = Math.min((sessions.length / sessionsNeeded) * 100, 100);
        }
      });
      setMasteryLevels(mastery);
    } catch (error) {
      console.error('Failed to calculate mastery:', error);
    }
  }, [stats.sessions, techniques]);

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
              {levelTechniques.map((technique) => (
                <TechniqueCard
                  key={technique.id}
                  technique={technique}
                  onSelect={onSelectTechnique}
                  masteryLevel={masteryLevels[technique.id] || 0}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}