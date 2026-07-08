export type HotspotPullRequestInput = {
  number: number;
  changedFileNames: string[];
  updatedAtGithub: Date;
};

export type HotspotAnalysisResult = {
  filePath: string;
  module: string;
  changeCount: number;
  riskScore: number;
  relatedPrNumbers: number[];
  lastTouchedAt: Date;
};

const CRITICAL_PATTERNS = [
  'auth',
  'payment',
  'billing',
  'security',
  'middleware',
  'schema.prisma',
  'migration',
  '.env',
  'config',
  'docker',
  'package.json',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'bun.lockb'
];

export function detectHotspotModule(filePath: string): string {
  const normalized = filePath.toLowerCase();

  if (normalized.includes('auth')) return 'Authentication';
  if (normalized.includes('payment') || normalized.includes('billing')) return 'Payments';
  if (normalized.includes('prisma') || normalized.includes('migration') || normalized.includes('schema')) return 'Database';
  if (normalized.includes('api') || normalized.includes('routes') || normalized.includes('controller')) return 'API';
  if (normalized.includes('components') || normalized.includes('pages') || normalized.includes('ui')) return 'Frontend UI';
  if (normalized.includes('test') || normalized.includes('spec')) return 'Testing';
  if (normalized.includes('docs') || normalized.includes('readme')) return 'Documentation';
  if (
    normalized.includes('config') ||
    normalized.includes('docker') ||
    normalized.includes('.env') ||
    normalized.includes('package')
  ) {
    return 'Configuration';
  }

  return 'Core';
}

function isCriticalFile(filePath: string): boolean {
  const normalized = filePath.toLowerCase();
  return CRITICAL_PATTERNS.some((pattern) => normalized.includes(pattern));
}

export function analyzeHotspots(prs: HotspotPullRequestInput[]): HotspotAnalysisResult[] {
  const fileMap = new Map<string, HotspotAnalysisResult>();

  for (const pr of prs) {
    for (const filePath of pr.changedFileNames) {
      const existing = fileMap.get(filePath);

      if (!existing) {
        fileMap.set(filePath, {
          filePath,
          module: detectHotspotModule(filePath),
          changeCount: 1,
          riskScore: 0,
          relatedPrNumbers: [pr.number],
          lastTouchedAt: pr.updatedAtGithub
        });
        continue;
      }

      existing.changeCount += 1;
      existing.relatedPrNumbers = Array.from(new Set([...existing.relatedPrNumbers, pr.number]));

      if (pr.updatedAtGithub.getTime() > existing.lastTouchedAt.getTime()) {
        existing.lastTouchedAt = pr.updatedAtGithub;
      }
    }
  }

  return Array.from(fileMap.values())
    .map((hotspot) => {
      const baseScore = Math.min(hotspot.changeCount * 15, 70);
      const criticalBoost = isCriticalFile(hotspot.filePath) ? 25 : 0;

      return {
        ...hotspot,
        riskScore: Math.min(baseScore + criticalBoost, 100)
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore || b.changeCount - a.changeCount);
}

