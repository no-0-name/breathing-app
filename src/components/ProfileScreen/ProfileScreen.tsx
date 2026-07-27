// src/components/ProfileScreen/ProfileScreen.tsx (полная версия с достижениями)
import './ProfileScreen.css';
import { useStatistics } from '../../hooks/useStatistics';
import { useAchievements } from '../../hooks/useAchievements';
import { getTechniqueById } from '../../data/techniques';
import { ScreenHeader } from '../ScreenHeader/ScreenHeader';

interface ProfileScreenProps {
  onGoHome: () => void;
}

export function ProfileScreen({ onGoHome }: ProfileScreenProps) {
  const { stats } = useStatistics();
  const { unlockedCount, totalAchievements, achievements } = useAchievements();
  const {
    sessions,
    totalSessions,
    totalMinutes,
    streakDays,
    favoriteTechnique,
  } = stats;

  // Находим название любимой техники
  let favoriteName = '—';
  if (favoriteTechnique) {
    const tech = getTechniqueById(favoriteTechnique);
    favoriteName = tech?.title || favoriteTechnique;
  }

  // Берём последние 5 сессий
  const recentSessions = [...sessions]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  return (
    <div className="profile-screen">
      <ScreenHeader title="Мой прогресс" onGoHome={onGoHome} />

      {/* СТАТИСТИКА */}
      <div className="profile-screen__grid">
        <div className="profile-stat">
          <div className="profile-stat__value">{totalSessions}</div>
          <div className="profile-stat__label">Сессий выполнено</div>
        </div>

        <div className="profile-stat">
          <div className="profile-stat__value">{totalMinutes}</div>
          <div className="profile-stat__label">Минут практики</div>
        </div>

        <div className="profile-stat">
          <div className="profile-stat__value profile-stat__value--accent">
            {streakDays}
          </div>
          <div className="profile-stat__label">Дней подряд 🔥</div>
        </div>

        <div className="profile-stat">
          <div className="profile-stat__value" style={{ fontSize: '24px' }}>
            {unlockedCount} / {totalAchievements}
          </div>
          <div className="profile-stat__label">Достижений получено</div>
        </div>

        <div className="profile-stat" style={{ gridColumn: 'span 2' }}>
          <div className="profile-stat__value" style={{ fontSize: '20px' }}>
            {favoriteName}
          </div>
          <div className="profile-stat__label">Любимая техника</div>
          {!favoriteTechnique && (
            <div className="profile-stat__sub">Пройдите первую сессию</div>
          )}
        </div>
      </div>

      {/* ПОСЛЕДНИЕ СЕССИИ */}
      {recentSessions.length > 0 && (
        <div className="profile-screen__recent">
          <h3 className="profile-screen__section-title">Последние сессии</h3>
          <div className="profile-screen__recent-list">
            {recentSessions.map((session) => {
              const date = new Date(session.timestamp);
              const dateStr = date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
              });
              const timeStr = date.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const duration = Math.ceil(session.durationSeconds / 60);
              return (
                <div key={session.id} className="recent-session">
                  <span className="recent-session__name">
                    {session.techniqueTitle}
                  </span>
                  <span className="recent-session__meta">
                    <span>{duration} мин</span>
                    <span>•</span>
                    <span>{dateStr} {timeStr}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ВСЕ ДОСТИЖЕНИЯ (полный список) */}
      <section className="profile-screen__achievements">
        <h3 className="profile-screen__section-title">Все достижения</h3>
        {achievements.length === 0 ? (
          <p className="profile-screen__empty-hint">Нет достижений</p>
        ) : (
          <div className="profile-screen__achievements-grid">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`profile-achievement ${
                  ach.unlocked ? 'profile-achievement--unlocked' : 'profile-achievement--locked'
                }`}
              >
                <div className="profile-achievement__icon">
                  {ach.icon}
                  {!ach.unlocked && <span className="profile-achievement__lock">🔒</span>}
                </div>
                <div className="profile-achievement__info">
                  <div className="profile-achievement__title">{ach.title}</div>
                  <div className="profile-achievement__progress">
                    <div className="profile-achievement__bar">
                      <div
                        className="profile-achievement__fill"
                        style={{
                          width: `${Math.min((ach.progress / ach.target) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="profile-achievement__text">
                      {Math.round((ach.progress / ach.target) * 100)}%
                    </span>
                  </div>
                  {ach.unlocked && ach.unlockedAt && (
                    <div className="profile-achievement__date">
                      Получено: {new Date(ach.unlockedAt).toLocaleDateString('ru-RU')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {sessions.length === 0 && (
        <div className="profile-screen__empty">
          <span className="profile-screen__empty-icon">🧘</span>
          <p>Вы ещё не завершили ни одной сессии</p>
          <p className="profile-screen__empty-hint">
            Начните практику, чтобы увидеть свою статистику
          </p>
        </div>
      )}
    </div>
  );
}