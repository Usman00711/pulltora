type SkeletonPanelProps = {
  rows?: number;
  variant?: 'panel' | 'dashboard' | 'table';
};

export function SkeletonPanel({ rows = 3, variant = 'panel' }: SkeletonPanelProps) {
  if (variant === 'dashboard') {
    return (
      <section className="space-y-5">
        <div className="panel p-5">
          <div className="shimmer-line h-5 w-40 rounded-full" />
          <div className="mt-4 shimmer-line h-9 max-w-lg rounded-xl" />
          <div className="mt-3 shimmer-line h-4 max-w-sm rounded-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="panel p-5">
              <div className="shimmer-line h-3 w-28 rounded-full" />
              <div className="mt-5 shimmer-line h-10 w-20 rounded-xl" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="panel p-5"><div className="shimmer-line h-64 rounded-2xl" /></div>
          <div className="panel p-5"><div className="shimmer-line h-64 rounded-2xl" /></div>
        </div>
      </section>
    );
  }

  if (variant === 'table') {
    return (
      <div className="panel p-5">
        <div className="shimmer-line h-4 w-44 rounded-full" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="grid grid-cols-4 gap-3">
              <div className="shimmer-line h-9 rounded-xl" />
              <div className="shimmer-line h-9 rounded-xl" />
              <div className="shimmer-line h-9 rounded-xl" />
              <div className="shimmer-line h-9 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="panel p-5">
      <div className="shimmer-line h-4 w-32 rounded-full" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="shimmer-line h-10 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
