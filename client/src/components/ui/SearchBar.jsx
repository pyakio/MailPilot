import { FiSearch, FiX } from 'react-icons/fi';

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search campaigns, templates, contacts...',
  className = '',
}) {
  return (
    <div className={`relative flex items-center w-full max-w-md ${className}`}>
      <FiSearch className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-500 shadow-xs transition-all"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <FiX className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
