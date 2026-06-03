import { ReactNode } from 'react';

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  color?: string;
}

export default function StatsCard({ icon, label, value, trend, color = 'bg-[var(--deep-blue)]' }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 border border-[var(--medium-gray)] hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`size-10 rounded-lg ${color} flex items-center justify-center text-white`}>
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-medium text-[var(--green-accent)] bg-[var(--green-accent)]/10 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-[var(--deep-blue)] tabular-nums">{value}</p>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">{label}</p>
      </div>
    </div>
  );
}
