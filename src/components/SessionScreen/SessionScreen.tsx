// src/components/SessionScreen/SessionScreen.tsx
import './SessionScreen.css';
import type { BreathingTechnique } from '../../types/breathing.types';
import { getLevelColor } from '../../data/levels';
import { useBreathingCycle } from '../../hooks/useBreathingCycle';
import { useTelegramWebApp } from '../../hooks/useTelegramWebApp';
import { useStatistics } from '../../hooks/useStatistics';
import { BreathingCircle } from '../BreathingCircle/BreathingCircle';
import { CycleProgress } from '../CycleProgress/CycleProgress';
import { Confetti } from '../Confetti/Confetti';
import { ScreenHeader } from '../ScreenHeader/ScreenHeader';
import { IconButton } from '../IconButton/IconButton';
import { PlayIcon, PauseIcon, ResetIcon } from '../IconButton/icons';
import { useState } from 'react';

interface SessionScreenProps {
  technique: BreathingTechnique;
  onGoHome: () => void;
}

export function SessionScreen({ technique, onGoHome }: SessionScreenProps) {
  const { hapticImpact, hapticSuccess } = useTelegramWebApp();
  const { addSession } = useStatistics();
  const accentColor = getLevelColor(technique.level);
  const [enableAudio, setEnableAudio] = useState(() => {
    const stored = localStorage.getItem('breathing-audio-enabled');
    return stored !== null ? stored === 'true' : true;
  });

  const { status, completedCycles, secondsLeftInPhase, currentPhase, start, pause, reset } = useBreathingCycle({
    phases: technique.phases,
    targetCycles: technique.recommendedCycles,
    // Убираем вибрацию на каждую смену фазы
    onPhaseChange: () => {
      // Только аудио, без вибрации
      // Аудио уже включено в хуке useBreathingCycle
    },
    onStart: () => {
      // Вибрация в начале практики
      console.log('[Haptic] Session started');
      hapticImpact('medium');
    },
    onFinished: () => {
      // Вибрация в конце практики
      console.log('[Haptic] Session finished');
      hapticSuccess();
      
      // Сохраняем сессию в статистику
      const totalDuration = technique.phases.reduce((acc, p) => acc + p.durationSec, 0) * technique.recommendedCycles;
      addSession({
        techniqueId: technique.id,
        techniqueTitle: technique.title,
        completedCycles: technique.recommendedCycles,
        durationSeconds: totalDuration,
        status: 'completed',
      });
      
      console.log('[Session] Completed!');
    },
    enableAudio,
  });

  const isRunning = status === 'running';
  const isFinished = status === 'finished';

  const toggleAudio = () => {
    const newValue = !enableAudio;
    setEnableAudio(newValue);
    localStorage.setItem('breathing-audio-enabled', String(newValue));
  };

  const audioButton = (
    <button
      className={`session-screen__audio-toggle ${enableAudio ? 'session-screen__audio-toggle--on' : ''}`}
      onClick={toggleAudio}
      aria-label={enableAudio ? 'Выключить звук' : 'Включить звук'}
      title={enableAudio ? 'Выключить звук' : 'Включить звук'}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {enableAudio ? (
          <>
            <path
              d="M11 5L6 9H2v6h4l5 4V5z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <path
              d="M11 5L6 9H2v6h4l5 4V5z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <line x1="23" y1="1" x2="1" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
      </svg>
    </button>
  );

  return (
    <div className="session-screen" style={{ ['--accent' as string]: accentColor }}>
      <div className="session-screen__header">
        <div className="session-screen__header-row">
          <ScreenHeader title={technique.title} onGoHome={onGoHome} rightElement={audioButton} />
        </div>
        <p className="session-screen__hint">{isFinished ? 'Практика завершена' : currentPhase.hint}</p>
      </div>

      <BreathingCircle phase={currentPhase} secondsLeft={secondsLeftInPhase} status={status} accentColor={accentColor} />

      <CycleProgress completedCycles={completedCycles} targetCycles={technique.recommendedCycles} />

      {isFinished ? (
        <div className="session-screen__finished">
          <Confetti />
          <p>Отлично! Вы выполнили {technique.recommendedCycles} циклов дыхания.</p>
          <button className="session-screen__restart-button" onClick={reset} type="button">
            Начать заново
          </button>
        </div>
      ) : (
        <div className="session-screen__controls">
          <IconButton aria-label="Сбросить" onClick={reset}>
            <ResetIcon />
          </IconButton>
          <IconButton
            aria-label={isRunning ? 'Пауза' : 'Начать'}
            variant="solid"
            onClick={isRunning ? pause : start}
          >
            {isRunning ? <PauseIcon /> : <PlayIcon />}
          </IconButton>
          <div className="session-screen__spacer" />
        </div>
      )}
    </div>
  );
}