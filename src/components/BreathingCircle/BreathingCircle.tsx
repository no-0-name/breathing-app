import './BreathingCircle.css';
import type { BreathingPhase, SessionStatus } from '../../types/breathing.types';

interface BreathingCircleProps {
  phase: BreathingPhase;
  secondsLeft: number;
  status: SessionStatus;
  accentColor: string;
}

/**
 * Purely presentational: it just reflects the phase it is given.
 * The animation duration is derived from the phase length so the circle's
 * motion is always in sync with the actual countdown (no hard-coded values).
 */
export function BreathingCircle({ phase, secondsLeft, status, accentColor }: BreathingCircleProps) {
  const isExpanded = phase.kind === 'inhale' || phase.kind === 'holdFull';
  const isRunning = status === 'running';

  return (
    <div className="breathing-circle" style={{ ['--accent' as string]: accentColor }}>
      <div
        className={`breathing-circle__aura ${isExpanded ? 'breathing-circle__aura--expanded' : ''}`}
        style={{ transitionDuration: `${phase.durationSec}s` }}
      />
      <div
        className={`breathing-circle__core ${isExpanded ? 'breathing-circle__core--expanded' : ''} ${
          isRunning ? 'breathing-circle__core--pulsing' : ''
        }`}
        style={{ transitionDuration: `${phase.durationSec}s` }}
      >
        <span className="breathing-circle__seconds">{secondsLeft}</span>
        <span className="breathing-circle__phase-label">{phase.label}</span>
      </div>
    </div>
  );
}
