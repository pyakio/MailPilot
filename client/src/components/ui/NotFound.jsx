import { Link } from 'react-router-dom';
import { PrimaryButton } from './PrimaryButton';
import { FiHome, FiCompass } from 'react-icons/fi';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-center">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl animate-fade-in">
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FiCompass className="w-8 h-8 animate-spin" style={{ animationDuration: '10s' }} />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          404 Error
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 mb-2">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          The page you are looking for might have been moved, deleted, or does not exist on our marketing cloud servers.
        </p>
        <Link to="/">
          <PrimaryButton icon={FiHome} fullWidth size="lg">
            Return to Dashboard
          </PrimaryButton>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
