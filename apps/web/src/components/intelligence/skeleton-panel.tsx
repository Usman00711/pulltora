type SkeletonPanelProps = {
  rows?: number;
};

export function SkeletonPanel({ rows = 3 }: SkeletonPanelProps) {
  return (
    <div className="panel p-5">
      <div className="h-4 w-32 animate-pulse rounded-full bg-white/10" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="h-10 animate-pulse rounded-xl bg-white/8" />
        ))}
      </div>
    </div>
  );
}

