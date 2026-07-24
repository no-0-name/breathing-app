// src/hooks/useAudioFeedback.ts (упрощаем, убираем возможные ошибки)
import { useCallback, useRef } from 'react';

/**
 * Hook for audio feedback during breathing phases.
 * Uses Web Audio API for simple beep sounds without needing audio files.
 */
export function useAudioFeedback() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Web Audio API not supported');
        return null;
      }
    }
    return audioContextRef.current;
  }, []);

  const playBeep = useCallback((frequency: number, duration: number, volume: number = 0.15) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      // Silently fail - audio is not critical
    }
  }, [getAudioContext]);

  const playInhaleSound = useCallback(() => {
    playBeep(440, 0.08, 0.1);
  }, [playBeep]);

  const playExhaleSound = useCallback(() => {
    playBeep(330, 0.08, 0.1);
  }, [playBeep]);

  const playHoldSound = useCallback(() => {
    playBeep(523, 0.06, 0.08);
  }, [playBeep]);

  const playTransitionSound = useCallback(() => {
    playBeep(660, 0.1, 0.12);
  }, [playBeep]);

  return {
    playInhaleSound,
    playExhaleSound,
    playHoldSound,
    playTransitionSound,
  };
}