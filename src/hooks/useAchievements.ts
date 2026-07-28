import { useState, useEffect, useCallback } from 'react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  target: number;
  category: 'sessions' | 'streak' | 'exploration';
}

export interface SessionStats {
  totalSessions: number;
  streakDays: number;
  uniqueTechniques: Set<string>;
  techniqueMastery: Record<string, number>;
}

const ACHIEVEMENTS_KEY = 'breathing_achievements';

const getAchievementDefinitions = () => {
  return [
    {
      id: 'first_session',
      title: 'Первый шаг',
      description: 'Завершите первую сессию',
      icon: '🌱',
      target: 1,
      category: 'sessions' as const,
    },
    {
      id: 'ten_sessions',
      title: 'Начинающий практик',
      description: 'Завершите 10 сессий',
      icon: '🌿',
      target: 10,
      category: 'sessions' as const,
    },
    {
      id: 'twenty_five_sessions',
      title: 'Уверенный практик',
      description: 'Завершите 25 сессий',
      icon: '🌳',
      target: 25,
      category: 'sessions' as const,
    },
    {
      id: 'fifty_sessions',
      title: 'Мастер дыхания',
      description: 'Завершите 50 сессий',
      icon: '🌟',
      target: 50,
      category: 'sessions' as const,
    },
    {
      id: 'hundred_sessions',
      title: 'Гуру дыхания',
      description: 'Завершите 100 сессий',
      icon: '🧘',
      target: 100,
      category: 'sessions' as const,
    },

    {
      id: 'streak_3',
      title: 'Первые шаги',
      description: 'Практикуйтесь 3 дня подряд',
      icon: '📅',
      target: 3,
      category: 'streak' as const,
    },
    {
      id: 'streak_7',
      title: 'Неделя практики',
      description: 'Практикуйтесь 7 дней подряд',
      icon: '📆',
      target: 7,
      category: 'streak' as const,
    },
    {
      id: 'streak_30',
      title: 'Месяц мастерства',
      description: 'Практикуйтесь 30 дней подряд',
      icon: '🏅',
      target: 30,
      category: 'streak' as const,
    },

    {
      id: 'all_beginner',
      title: 'Начинающий исследователь',
      description: 'Попробуйте все техники для начинающих (8)',
      icon: '🔍',
      target: 8,
      category: 'exploration' as const,
    },
    {
      id: 'all_intermediate',
      title: 'Продвинутый исследователь',
      description: 'Попробуйте все техники среднего уровня (8)',
      icon: '🔬',
      target: 8,
      category: 'exploration' as const,
    },
    {
      id: 'all_advanced',
      title: 'Мастер-исследователь',
      description: 'Попробуйте все продвинутые техники (10)',
      icon: '🧪',
      target: 10,
      category: 'exploration' as const,
    },
    {
      id: 'all_techniques',
      title: 'Полная коллекция',
      description: 'Попробуйте все техники (30)',
      icon: '🏆',
      target: 30,
      category: 'exploration' as const,
    },
  ];
};

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [totalAchievements, setTotalAchievements] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const definitions = getAchievementDefinitions();
      setTotalAchievements(definitions.length);

      const stored = localStorage.getItem(ACHIEVEMENTS_KEY);
      let parsedData: Achievement[] = [];

      if (stored) {
        try {
          parsedData = JSON.parse(stored);
        } catch {
          parsedData = [];
        }
      }

      const merged = definitions.map(def => {
        const existing = parsedData.find((a: Achievement) => a.id === def.id);
        return {
          ...def,
          unlocked: existing?.unlocked || false,
          unlockedAt: existing?.unlockedAt,
          progress: existing?.progress || 0,
        };
      });

      setAchievements(merged);
      setUnlockedCount(merged.filter(a => a.unlocked).length);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize achievements:', error);
      setIsInitialized(true);
    }
  }, []);

  const updateAchievement = useCallback((id: string, progress: number) => {
    setAchievements(prev => {
      const updated = prev.map(a => {
        if (a.id === id) {
          const newProgress = Math.min(progress, a.target);
          const unlocked = newProgress >= a.target;
          return {
            ...a,
            progress: newProgress,
            unlocked,
            unlockedAt: unlocked && !a.unlocked ? Date.now() : a.unlockedAt,
          };
        }
        return a;
      });

      try {
        localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save achievements:', error);
      }

      setUnlockedCount(updated.filter(a => a.unlocked).length);
      return updated;
    });
  }, []);

  const checkAchievements = useCallback((stats: SessionStats) => {
    updateAchievement('first_session', stats.totalSessions);
    updateAchievement('ten_sessions', stats.totalSessions);
    updateAchievement('twenty_five_sessions', stats.totalSessions);
    updateAchievement('fifty_sessions', stats.totalSessions);
    updateAchievement('hundred_sessions', stats.totalSessions);

    updateAchievement('streak_3', stats.streakDays);
    updateAchievement('streak_7', stats.streakDays);
    updateAchievement('streak_30', stats.streakDays);

    const beginnerTechniques = [
      'box-breathing',
      'coherent-breathing',
      'relaxing-exhale',
      'morning-energy',
      'calming-breath',
      'mindful-breathing',
      'balanced-breath',
      'grounding-breath',
    ];

    const intermediateTechniques = [
      '4-7-8',
      'diaphragmatic',
      'energizing-breath',
      'anti-stress',
      'focus-breath',
      'heart-coherence',
      'recovery-breath',
      'sleep-inducing',
    ];

    const advancedTechniques = [
      'alternate-nostril',
      'extended-box-breathing',
      'wim-hof',
      'anulom-vilom',
      'kapalabhati',
      'breath-of-fire',
      'deep-diaphragmatic',
      'pranayama',
      'bhastrika',
      'sitali',
    ];

    let beginnerCount = 0;
    let intermediateCount = 0;
    let advancedCount = 0;

    stats.uniqueTechniques.forEach(id => {
      if (beginnerTechniques.includes(id)) beginnerCount++;
      if (intermediateTechniques.includes(id)) intermediateCount++;
      if (advancedTechniques.includes(id)) advancedCount++;
    });

    updateAchievement('all_beginner', beginnerCount);
    updateAchievement('all_intermediate', intermediateCount);
    updateAchievement('all_advanced', advancedCount);
    updateAchievement('all_techniques', stats.uniqueTechniques.size);
  }, [updateAchievement]);

  const getUnlockedAchievements = useCallback(() => {
    return achievements.filter(a => a.unlocked);
  }, [achievements]);

  const getLockedAchievements = useCallback(() => {
    return achievements.filter(a => !a.unlocked);
  }, [achievements]);

  const getProgressPercentage = useCallback(() => {
    if (totalAchievements === 0) return 0;
    return Math.round((unlockedCount / totalAchievements) * 100);
  }, [unlockedCount, totalAchievements]);

  const resetAchievements = useCallback(() => {
    try {
      localStorage.removeItem(ACHIEVEMENTS_KEY);
      const definitions = getAchievementDefinitions();
      const reset = definitions.map(def => ({
        ...def,
        unlocked: false,
        progress: 0,
      }));
      setAchievements(reset);
      setUnlockedCount(0);
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(reset));
    } catch (error) {
      console.error('Failed to reset achievements:', error);
    }
  }, []);

  return {
    achievements,
    unlockedCount,
    totalAchievements,
    isInitialized,
    getUnlockedAchievements,
    getLockedAchievements,
    getProgressPercentage,
    checkAchievements,
    updateAchievement,
    resetAchievements,
  };
}