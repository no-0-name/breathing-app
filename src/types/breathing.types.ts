export type BreathingPhaseKind = 'inhale' | 'holdFull' | 'exhale' | 'holdEmpty';

export interface BreathingPhase {
  kind: BreathingPhaseKind;
  durationSec: number;
  label: string;
  hint: string;
}

export type TechniqueLevel = 'beginner' | 'intermediate' | 'advanced';

export interface BreathingTechnique {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  benefits: string[];
  level: TechniqueLevel;
  phases: BreathingPhase[];
  recommendedCycles: number;
  isPremium?: boolean; 
}

export type SessionStatus = 'idle' | 'running' | 'paused' | 'finished';

export interface BreathingCycleState {
  status: SessionStatus;
  currentPhaseIndex: number;
  secondsLeftInPhase: number;
  completedCycles: number;
}
