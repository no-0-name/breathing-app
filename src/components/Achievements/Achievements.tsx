// src/components/Achievements/Achievements.tsx (исправленный)
import './Achievements.css';
import { useAchievements } from '../../hooks/useAchievements';
import { useState } from 'react';

export function Achievements() {
  const { 
    unlockedCount, 
    totalAchievements, 
    getUnlockedAchievements,
    getLockedAchievements,
    getProgressPercentage,
    isInitialized,
  } = useAchievements();

  const [showAll, setShowAll] = useState(false);

  // Показываем заглушку пока инициализируется
  if (!isInitialized) {
    return (
      <div className="achievements">
        <div className="achievements__header">
          <div className="achievements__title-row">
            <h2 className="achievements__title">🏆 Достижения</h2>
          </div>
        </div>
        <div className="achievements__loading">Загрузка...</div>
      </div>
    );
  }

  const unlocked = getUnlockedAchievements();
  const locked = getLockedAchievements();
  const displayedAchievements = showAll ? [...unlocked, ...locked] : unlocked.slice(0, 4);

  return (
    <div className="achievements">
      <div className="achievements__header">
        <div className="achievements__title-row">
          <h2 className="achievements__title">🏆 Достижения</h2>
          <span className="achievements__count">
            {unlockedCount} / {totalAchievements}
          </span>
        </div>
        <div className="achievements__progress-bar">
          <div 
            className="achievements__progress-fill" 
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {displayedAchievements.length === 0 ? (
        <div className="achievements__empty">
          <p>Нет достижений</p>
          <p className="achievements__empty-hint">Пройдите первую практику, чтобы начать коллекционировать достижения!</p>
        </div>
      ) : (
        <div className="achievements__grid">
          {displayedAchievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className={`achievement-card ${achievement.unlocked ? 'achievement-card--unlocked' : 'achievement-card--locked'}`}
            >
              <div className="achievement-card__icon">
                {achievement.icon}
                {!achievement.unlocked && (
                  <div className="achievement-card__lock">🔒</div>
                )}
              </div>
              <div className="achievement-card__info">
                <div className="achievement-card__title">{achievement.title}</div>
                <div className="achievement-card__description">{achievement.description}</div>
                {!achievement.unlocked && (
                  <div className="achievement-card__progress">
                    <div className="achievement-card__progress-bar">
                      <div 
                        className="achievement-card__progress-fill" 
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                    <span className="achievement-card__progress-text">
                      {Math.round(achievement.progress)}%
                    </span>
                  </div>
                )}
                {achievement.unlocked && achievement.unlockedAt && (
                  <div className="achievement-card__date">
                    Получено: {new Date(achievement.unlockedAt).toLocaleDateString('ru-RU')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {(unlocked.length + locked.length) > 4 && (
        <button 
          className="achievements__toggle"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Скрыть' : `Показать все (${unlocked.length + locked.length})`}
        </button>
      )}
    </div>
  );
}