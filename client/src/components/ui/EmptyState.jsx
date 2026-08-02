import { PrimaryButton } from './PrimaryButton';
import { FiInbox } from 'react-icons/fi';

export function EmptyState({
  title = 'No data available',
  description = 'Get started by creating your first item or adjusting your search filters.',
  actionLabel,
  onAction,
  icon: Icon = FiInbox,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
      <div className="p-4 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-4 shadow-xs">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <PrimaryButton onClick={onAction} size="sm">
          {actionLabel}
        </PrimaryButton>
      )}
    </div>
  );
}

export default EmptyState;
