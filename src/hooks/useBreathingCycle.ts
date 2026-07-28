import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { BreathingCycleState, BreathingPhase, SessionStatus } from '../types/breathing.types';
import { useAudioFeedback } from './useAudioFeedback';

const TICK_INTERVAL_MS = 100;

interface UseBreathingCycleOptions {
  phases: BreathingPhase[];
  targetCycles: number;
  onPhaseChange?: (phase: BreathingPhase) => void;
  onFinished?: () => void;
  onStart?: () => void;
  enableAudio?: boolean;
}

interface UseBreathingCycleResult extends BreathingCycleState {
  currentPhase: BreathingPhase;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

interface MachineState {
  status: SessionStatus;
  currentPhaseIndex: number;
  completedCycles: number;
}

type MachineAction = 
  | { type: 'START' } 
  | { type: 'PAUSE' } 
  | { type: 'RESET' } 
  | { type: 'ADVANCE_PHASE' };

const INITIAL_MACHINE_STATE: MachineState = { status: 'idle', currentPhaseIndex: 0, completedCycles: 0 };

function createMachineReducer(phaseCount: number, targetCycles: number) {
  return function machineReducer(state: MachineState, action: MachineAction): MachineState {
    switch (action.type) {
      case 'START':
        if (state.status === 'paused') {
          return { ...state, status: 'running' };
        }
        return { status: 'running', currentPhaseIndex: 0, completedCycles: 0 };

      case 'PAUSE':
        return state.status === 'running' ? { ...state, status: 'paused' } : state;

      case 'RESET':
        return INITIAL_MACHINE_STATE;

      case 'ADVANCE_PHASE': {
        if (state.status !== 'running') return state;

        const isLastPhaseOfCycle = state.currentPhaseIndex === phaseCount - 1;
        const nextPhaseIndex = isLastPhaseOfCycle ? 0 : state.currentPhaseIndex + 1;
        const completedCycles = isLastPhaseOfCycle ? state.completedCycles + 1 : state.completedCycles;

        if (isLastPhaseOfCycle && completedCycles >= targetCycles) {
          return { status: 'finished', currentPhaseIndex: state.currentPhaseIndex, completedCycles };
        }

        return { status: 'running', currentPhaseIndex: nextPhaseIndex, completedCycles };
      }

      default:
        return state;
    }
  };
}

export function useBreathingCycle({
  phases,
  targetCycles,
  onPhaseChange,
  onFinished,
  onStart,
  enableAudio = true,
}: UseBreathingCycleOptions): UseBreathingCycleResult {
  const machineReducer = useMemo(
    () => createMachineReducer(phases.length, targetCycles),
    [phases.length, targetCycles],
  );
  const [machine, dispatch] = useReducer(machineReducer, INITIAL_MACHINE_STATE);

  const [secondsLeftInPhase, setSecondsLeftInPhase] = useState(phases[0]?.durationSec ?? 0);

  const phaseEndTimestampRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const resumeMsOverrideRef = useRef<number | null>(null);
  const pendingFinishRef = useRef(false);
  const previousPhaseIndexRef = useRef<number>(-1);
  const hasNotifiedStartRef = useRef(false);

  const onPhaseChangeRef = useRef(onPhaseChange);
  const onFinishedRef = useRef(onFinished);
  const onStartRef = useRef(onStart);
  
  const audio = useAudioFeedback();

  useEffect(() => {
    onPhaseChangeRef.current = onPhaseChange;
    onFinishedRef.current = onFinished;
    onStartRef.current = onStart;
  });

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    if (pendingFinishRef.current) {
      pendingFinishRef.current = false;
      dispatch({ type: 'ADVANCE_PHASE' });
      return;
    }

    const msLeft = phaseEndTimestampRef.current - Date.now();
    if (msLeft > 0) {
      setSecondsLeftInPhase(Math.ceil(msLeft / 1000));
      return;
    }

    const isLastPhaseOfCycle = machine.currentPhaseIndex === phases.length - 1;
    const isLastCycle = isLastPhaseOfCycle && machine.completedCycles + 1 >= targetCycles;

    if (isLastCycle) {
      setSecondsLeftInPhase(0);
      pendingFinishRef.current = true;
    } else {
      dispatch({ type: 'ADVANCE_PHASE' });
    }
  }, [machine.currentPhaseIndex, machine.completedCycles, phases.length, targetCycles]);

  useEffect(() => {
    if (machine.status !== 'running') return;
    
    const currentIndex = machine.currentPhaseIndex;
    if (previousPhaseIndexRef.current === currentIndex) return;
    previousPhaseIndexRef.current = currentIndex;

    const phase = phases[currentIndex];
    if (!phase) return;

    onPhaseChangeRef.current?.(phase);

    if (enableAudio) {
      switch (phase.kind) {
        case 'inhale':
          audio.playInhaleSound();
          break;
        case 'exhale':
          audio.playExhaleSound();
          break;
        case 'holdFull':
        case 'holdEmpty':
          audio.playHoldSound();
          break;
      }
    }
  }, [machine.status, machine.currentPhaseIndex, phases, enableAudio, audio]);

  useEffect(() => {
    if (machine.status !== 'running') return;

    const phase = phases[machine.currentPhaseIndex];
    const durationMs = resumeMsOverrideRef.current ?? phase.durationSec * 1000;
    resumeMsOverrideRef.current = null;
    pendingFinishRef.current = false;

    setSecondsLeftInPhase(Math.ceil(durationMs / 1000));
    phaseEndTimestampRef.current = Date.now() + durationMs;

    clearTimer();
    intervalRef.current = window.setInterval(tick, TICK_INTERVAL_MS);

    return clearTimer;
  }, [machine.status, machine.currentPhaseIndex, phases, clearTimer, tick]);

  useEffect(() => {
    if (machine.status === 'finished') {
      clearTimer();
      onFinishedRef.current?.();
    }
  }, [machine.status, clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  const start = useCallback(() => {
    previousPhaseIndexRef.current = -1;
    pendingFinishRef.current = false;
    hasNotifiedStartRef.current = false;
    
    dispatch({ type: 'START' });
    
    if (machine.status === 'idle' || machine.status === 'paused') {
      onStartRef.current?.();
    }
  }, [machine.status]);

  const pause = useCallback(() => {
    resumeMsOverrideRef.current = Math.max(0, phaseEndTimestampRef.current - Date.now());
    dispatch({ type: 'PAUSE' });
  }, []);

  const reset = useCallback(() => {
    resumeMsOverrideRef.current = null;
    pendingFinishRef.current = false;
    previousPhaseIndexRef.current = -1;
    hasNotifiedStartRef.current = false;
    setSecondsLeftInPhase(phases[0]?.durationSec ?? 0);
    dispatch({ type: 'RESET' });
  }, [phases]);

  return {
    status: machine.status,
    currentPhaseIndex: machine.currentPhaseIndex,
    secondsLeftInPhase,
    completedCycles: machine.completedCycles,
    currentPhase: phases[machine.currentPhaseIndex] ?? phases[0],
    start,
    pause,
    reset,
  };
}