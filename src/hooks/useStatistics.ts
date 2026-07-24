// src/hooks/useStatistics.ts (исправленный)
import { useState } from 'react';
import { useAchievements } from './useAchievements';

interface SessionRecord {
  id: string;
  techniqueId: string;
  techniqueTitle: string;
  completedCycles: number;
  durationSeconds: number;
  timestamp: number;
  status: 'completed' | 'interrupted';
}

interface Statistics {
  sessions: SessionRecord[];
  totalSessions: number;
  totalMinutes: number;
  lastSessionDate: number | null;
  streakDays: number;
  favoriteTechnique: string | null;
}

const STORAGE_KEY = 'breathing_stats';

// Выносим функцию за пределы хука
const getDefaultStats = (): Statistics => ({
  sessions: [],
  totalSessions: 0,
  totalMinutes: 0,
  lastSessionDate: null,
  streakDays: 0,
  favoriteTechnique: null,
});

const calculateStreak = (sessions: SessionRecord[]): number => {
  if (sessions.length === 0) return 0;
  
  const sorted = [...sessions].sort((a, b) => b.timestamp - a.timestamp);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  for (const session of sorted) {
    const sessionDate = new Date(session.timestamp);
    sessionDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (diffDays > streak) {
      break;
    }
  }
  
  return streak;
};

export function useStatistics() {
  const { checkAchievements } = useAchievements();
  
  const [stats, setStats] = useState<Statistics>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const streak = calculateStreak(parsed.sessions || []);
        return { ...parsed, streakDays: streak };
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
    return getDefaultStats();
  });

  const addSession = (session: Omit<SessionRecord, 'id' | 'timestamp'>) => {
    const newSession: SessionRecord = {
      ...session,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    setStats(prev => {
      const sessions = [...prev.sessions, newSession];
      const totalSessions = sessions.length;
      const totalMinutes = sessions.reduce((acc, s) => acc + Math.ceil(s.durationSeconds / 60), 0);
      const lastSessionDate = newSession.timestamp;
      
      // Find favorite technique
      const techniqueCount: Record<string, number> = {};
      const techniqueMastery: Record<string, number> = {};
      const uniqueTechniques = new Set<string>();
      
      sessions.forEach(s => {
        techniqueCount[s.techniqueId] = (techniqueCount[s.techniqueId] || 0) + 1;
        techniqueMastery[s.techniqueId] = (techniqueMastery[s.techniqueId] || 0) + 1;
        uniqueTechniques.add(s.techniqueId);
      });
      
      let favoriteTechnique = null;
      let maxCount = 0;
      for (const [id, count] of Object.entries(techniqueCount)) {
        if (count > maxCount) {
          maxCount = count;
          favoriteTechnique = id;
        }
      }
      
      const streakDays = calculateStreak(sessions);
      
      const newStats = {
        sessions,
        totalSessions,
        totalMinutes,
        lastSessionDate,
        streakDays,
        favoriteTechnique,
      };
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
      } catch (error) {
        console.error('Failed to save statistics:', error);
      }
      
      // Check achievements after saving
      try {
        checkAchievements({
          totalSessions,
          streakDays,
          uniqueTechniques,
          techniqueMastery,
        });
      } catch (error) {
        console.error('Failed to check achievements:', error);
      }
      
      return newStats;
    });
  };

  const clearStats = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear statistics:', error);
    }
    setStats(getDefaultStats());
  };

  return { stats, addSession, clearStats };
}