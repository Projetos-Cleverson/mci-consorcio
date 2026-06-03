interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = ((current + 1) / total) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-[var(--text-muted)]">
          Pergunta {current + 1} de {total}
        </span>
        <span className="text-xs font-medium text-[var(--deep-blue)]">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="h-2 bg-[var(--medium-gray)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--green-accent)] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
