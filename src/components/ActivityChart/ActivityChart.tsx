import './ActivityChart.css';
import { useState } from 'react';
import { useStatistics } from '../../hooks/useStatistics';

export function ActivityChart() {
  const { stats } = useStatistics();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const days = 7;
  const today = new Date();
  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const dayData = dates.map((date) => {
    const dayStart = date.getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    const sessions = stats.sessions.filter(s => s.timestamp >= dayStart && s.timestamp < dayEnd);
    const count = sessions.length;
    return { date, count, sessions };
  });

  const maxCount = Math.max(1, ...dayData.map(d => d.count));

  const handleDayClick = (dateStr: string) => {
    setSelectedDay(prev => prev === dateStr ? null : dateStr);
  };

  const selectedData = dayData.find(d => d.date.toISOString().split('T')[0] === selectedDay);

  return (
    <div className="activity-chart">
      <h4 className="activity-chart__title">Активность за неделю</h4>
      <div className="activity-chart__bars">
        {dayData.map(({ date, count }) => {
          const height = (count / maxCount) * 100;
          const dayLabel = date.toLocaleDateString('ru-RU', { weekday: 'short' });
          const dateStr = date.toISOString().split('T')[0];
          const isActive = selectedDay === dateStr;
          return (
            <div
              key={dateStr}
              className={`activity-chart__bar-wrapper ${isActive ? 'activity-chart__bar-wrapper--active' : ''}`}
              onClick={() => handleDayClick(dateStr)}
              role="button"
              tabIndex={0}
              aria-label={`${dayLabel}, ${count} сессий`}
            >
              <div className="activity-chart__bar" style={{ height: `${height}%` }}>
                {count > 0 && <span className="activity-chart__bar-count">{count}</span>}
              </div>
              <span className="activity-chart__bar-label">{dayLabel}</span>
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <div className="activity-chart__day-details">
          <h5 className="activity-chart__day-title">
            {new Date(selectedDay).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h5>
          {selectedData && selectedData.sessions.length > 0 ? (
            <ul className="activity-chart__session-list">
              {selectedData.sessions.map((session) => (
                <li key={session.id} className="activity-chart__session-item">
                  <span>{session.techniqueTitle}</span>
                  <span className="activity-chart__session-meta">
                    {new Date(session.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    {' • '}
                    {Math.ceil(session.durationSeconds / 60)} мин
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="activity-chart__no-sessions">В этот день не было дыхательных сессий</p>
          )}
          <button className="activity-chart__close-details" onClick={() => setSelectedDay(null)}>
            Закрыть
          </button>
        </div>
      )}
    </div>
  );
}