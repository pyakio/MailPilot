import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { SecondaryButton } from '../ui/SecondaryButton';
import { FiCode, FiCopy, FiEye } from 'react-icons/fi';
import { useToast } from '../../hooks/useToast';

export function TemplatesGrid({ templates = [], onPreview }) {
  const { addToast } = useToast();

  const handleCopyTag = (tag) => {
    navigator.clipboard.writeText(tag);
    addToast({
      title: 'Copied to Clipboard',
      message: `Variable ${tag} ready to insert.`,
      type: 'success',
      duration: 2000,
    });
  };

  if (templates.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
        No email templates saved yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((t) => (
        <Card
          key={t.id}
          className="flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <FiCode className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">{t.title}</h4>
              </div>
              <Badge variant="info" size="sm">
                HTML Ready
              </Badge>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl font-mono border border-slate-100 dark:border-slate-800 mb-4 leading-relaxed">
              {t.body}
            </p>

            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Variables
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => handleCopyTag('{{name}}')}
                  className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
                >
                  {"{{name}}"}
                </button>
                <button
                  onClick={() => handleCopyTag('{{company}}')}
                  className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
                >
                  {"{{company}}"}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">ID: #{t.id}</span>
            <SecondaryButton
              size="sm"
              icon={FiEye}
              onClick={() => onPreview && onPreview(t)}
            >
              Preview
            </SecondaryButton>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default TemplatesGrid;
