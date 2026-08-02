export function SkeletonLoader({ type = 'card', count = 1 }) {
  const items = Array.from({ length: count });

  if (type === 'stat') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((_, i) => (
          <div key={i} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-3" />
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2" />
            <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-4 animate-pulse">
        <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4" />
        {items.map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/6" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/8 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((_, i) => (
        <div key={i} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse">
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-4" />
          <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-full mb-2" />
          <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

export default SkeletonLoader;
