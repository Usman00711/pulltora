import { RepositoryInsightImpact, RepositoryInsightSource } from '@devpulse/shared';

export function getInsightSourceLabel(source: RepositoryInsightSource) {
  if (source === 'GEMINI_AI') return 'Gemini AI';
  if (source === 'LOCAL_AI') return 'Local AI';
  return 'Rules';
}

export function getInsightImpactClass(impact: RepositoryInsightImpact) {
  if (impact === 'CRITICAL') return 'text-red-300 border-red-400/40 bg-red-400/10';
  if (impact === 'HIGH') return 'text-amber-200 border-amber-300/40 bg-amber-300/10';
  if (impact === 'MEDIUM') return 'text-violet-200 border-violet-300/40 bg-violet-300/10';
  return 'text-emerald-200 border-emerald-300/40 bg-emerald-300/10';
}
