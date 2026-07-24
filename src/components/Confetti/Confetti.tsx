import './Confetti.css';
import { useMemo } from 'react';

const CONFETTI_COLORS = ['#7DD8C8', '#9C8CF2', '#F2A48B', '#8CD98C', '#7FB8F0'];
const PIECE_COUNT = 60;

interface ConfettiPiece {
  id: number;
  leftPercent: number;
  delaySec: number;
  durationSec: number;
  color: string;
  rotateStartDeg: number;
  driftPx: number;
  widthPx: number;
  heightPx: number;
}

function createPieces(): ConfettiPiece[] {
  return Array.from({ length: PIECE_COUNT }, (_, id) => {
    const widthPx = 6 + Math.random() * 6;
    return {
      id,
      leftPercent: Math.random() * 100,
      delaySec: Math.random() * 0.4,
      durationSec: 2.2 + Math.random() * 1.4,
      color: CONFETTI_COLORS[id % CONFETTI_COLORS.length],
      rotateStartDeg: Math.random() * 360,
      driftPx: (Math.random() - 0.5) * 140,
      widthPx,
      heightPx: widthPx * 0.4,
    };
  });
}

/**
 * A one-shot confetti burst that gives the person a visible "you did it"
 * moment when a session finishes.
 *
 * Purely decorative: it sits on top of everything, ignores pointer events,
 * and never blocks interaction. Pieces are generated once per mount via
 * useMemo, so re-renders of the parent don't restart or multiply the burst.
 * The global `prefers-reduced-motion` rule in styles/global.css collapses
 * all animation durations app-wide, so this automatically becomes a brief,
 * non-distracting flash for people who have that preference set.
 */
export function Confetti() {
  const pieces = useMemo(createPieces, []);

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="confetti__piece"
          style={{
            left: `${piece.leftPercent}%`,
            width: piece.widthPx,
            height: piece.heightPx,
            backgroundColor: piece.color,
            animationDelay: `${piece.delaySec}s`,
            animationDuration: `${piece.durationSec}s`,
            transform: `rotate(${piece.rotateStartDeg}deg)`,
            ['--drift' as string]: `${piece.driftPx}px`,
          }}
        />
      ))}
    </div>
  );
}
