/**
 * Domain types for the breathing app.
 * Kept separate from UI components so the "business rules" of a breathing
 * session do not depend on how they are rendered (Dependency Inversion).
 */

/** A single phase inside one breathing cycle, e.g. "inhale" or "hold". */
export type BreathingPhaseKind = 'inhale' | 'holdFull' | 'exhale' | 'holdEmpty';

/** One step of a technique: what to do and for how long (in seconds). */
export interface BreathingPhase {
  kind: BreathingPhaseKind;
  /** Duration of this phase in seconds. */
  durationSec: number;
  /** Russian label shown to the user, e.g. "Вдох". */
  label: string;
  /** Short instruction shown under the label. */
  hint: string;
}

/** Difficulty helps a user pick a technique that fits their experience. */
export type TechniqueLevel = 'beginner' | 'intermediate' | 'advanced';

/** Static description of a breathing technique (data, not behaviour). */
export interface BreathingTechnique {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  /** What this technique helps with, shown as tags in the UI. */
  benefits: string[];
  level: TechniqueLevel;
  /** Ordered list of phases that make up a single cycle. */
  phases: BreathingPhase[];
  /** Recommended number of cycles for one session. */
  recommendedCycles: number;
}

/** Runtime status of an active breathing session. */
export type SessionStatus = 'idle' | 'running' | 'paused' | 'finished';

/** Snapshot of the breathing cycle state at a given moment. */
export interface BreathingCycleState {
  status: SessionStatus;
  currentPhaseIndex: number;
  secondsLeftInPhase: number;
  completedCycles: number;
}
