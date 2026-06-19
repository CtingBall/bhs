import type { StatusInstance } from '@/types';
import { STATUS_EMOJI, STATUS_LABEL } from '@/engine/status';

export default function StatusIcons({
  statuses,
  size = 'sm',
}: {
  statuses: StatusInstance[];
  size?: 'sm' | 'md';
}) {
  if (!statuses || statuses.length === 0) return null;
  const px = size === 'md' ? 'text-sm px-2 py-0.5' : 'text-[10px] px-1.5 py-0.5';
  return (
    <div className="flex flex-wrap gap-1">
      {statuses.map((s) => (
        <span
          key={s.type}
          title={`${STATUS_LABEL[s.type]} ${s.amount}`}
          className={`${px} inline-flex items-center gap-0.5 rounded bg-ink/70 border border-mint/30 font-mono text-mint-light`}
        >
          <span>{STATUS_EMOJI[s.type]}</span>
          <span>{s.amount}</span>
        </span>
      ))}
    </div>
  );
}
