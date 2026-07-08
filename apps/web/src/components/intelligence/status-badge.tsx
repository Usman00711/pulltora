import { ContributorWorkloadLevel, HealthLevel, PullRequestRiskLevel } from '@devpulse/shared';

type StatusBadgeProps = {
  label: string;
  tone?: 'cyan' | 'violet' | 'green' | 'amber' | 'rose' | 'slate';
};

export function getRiskTone(level: PullRequestRiskLevel) {
  if (level === 'CRITICAL') return 'rose';
  if (level === 'HIGH') return 'amber';
  if (level === 'MEDIUM') return 'violet';
  return 'green';
}

export function getHealthTone(level: HealthLevel) {
  if (level === 'AT_RISK') return 'rose';
  if (level === 'WATCH') return 'amber';
  if (level === 'STABLE') return 'cyan';
  return 'green';
}

export function getWorkloadTone(level: ContributorWorkloadLevel) {
  if (level === 'AT_RISK') return 'rose';
  if (level === 'OVERLOADED') return 'amber';
  if (level === 'BUSY') return 'violet';
  return 'green';
}

export function getScoreTone(score: number) {
  if (score >= 75) return 'rose';
  if (score >= 50) return 'amber';
  if (score >= 25) return 'violet';
  return 'green';
}

export function StatusBadge({ label, tone = 'slate' }: StatusBadgeProps) {
  const classes = {
    cyan: 'border-cyan-300/40 bg-cyan-400/10 text-cyan-100 shadow-cyan-500/10',
    violet: 'border-violet-300/40 bg-violet-400/10 text-violet-100 shadow-violet-500/10',
    green: 'border-emerald-300/40 bg-emerald-400/10 text-emerald-100 shadow-emerald-500/10',
    amber: 'border-amber-300/40 bg-amber-400/10 text-amber-100 shadow-amber-500/10',
    rose: 'border-rose-300/40 bg-rose-400/10 text-rose-100 shadow-rose-500/10',
    slate: 'border-slate-600/60 bg-slate-900/50 text-slate-200 shadow-slate-500/10'
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] shadow-lg ${classes[tone]}`}>
      {label}
    </span>
  );
}

