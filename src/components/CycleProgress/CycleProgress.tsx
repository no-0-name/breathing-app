import './CycleProgress.css';

interface CycleProgressProps {
  completedCycles: number;
  targetCycles: number;
}

export function CycleProgress({ completedCycles, targetCycles }: CycleProgressProps) {
  const MAX_VISIBLE_DOTS = 20;
  
  const showDots = Math.min(targetCycles, MAX_VISIBLE_DOTS);
  const hasMoreCycles = targetCycles > MAX_VISIBLE_DOTS;
  const remainingCycles = targetCycles - MAX_VISIBLE_DOTS;

  return (
    <div className="cycle-progress" role="status" aria-label={`Цикл ${completedCycles} из ${targetCycles}`}>
      <div className="cycle-progress__dots">
        {Array.from({ length: showDots }).map((_, index) => {
          const isCompleted = index < completedCycles;
          const isPartial = hasMoreCycles && index === showDots - 1 && completedCycles > showDots;
          return (
            <span
              key={index}
              className={`cycle-progress__dot ${
                isCompleted || isPartial ? 'cycle-progress__dot--done' : ''
              } ${isPartial ? 'cycle-progress__dot--partial' : ''}`}
            />
          );
        })}
        {hasMoreCycles && (
          <span className="cycle-progress__more">
            +{remainingCycles}
          </span>
        )}
      </div>
      <span className="cycle-progress__label">
        {Math.min(completedCycles, targetCycles)} / {targetCycles}
      </span>
    </div>
  );
}