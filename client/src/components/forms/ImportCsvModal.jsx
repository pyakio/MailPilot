import { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { PrimaryButton } from '../ui/PrimaryButton';
import { SecondaryButton } from '../ui/SecondaryButton';
import { FiUploadCloud, FiFileText } from 'react-icons/fi';

export function ImportCsvModal({ isOpen, onClose, onSubmit, loading = false }) {
  const [csvRaw, setCsvRaw] = useState(
    'name,email,tags\nJohn Doe,john@example.com,lead,trial\nJane Smith,jane@acme.io,customer,vip'
  );

  const parsedRows = useMemo(() => {
    if (!csvRaw.trim()) return [];
    const lines = csvRaw.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return [];
    return lines.slice(1).map((line) => {
      const parts = line.split(',').map((p) => p.trim());
      return {
        name: parts[0] || '',
        email: parts[1] || '',
        tags: parts.slice(2).join(', '),
      };
    }).filter((r) => r.email);
  }, [csvRaw]);

  const handleImport = () => {
    if (parsedRows.length === 0) return;
    onSubmit(parsedRows);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setCsvRaw(evt.target.result);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Contacts from CSV" maxWidth="max-w-2xl">
      <div className="space-y-4">
        {/* Upload box */}
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center bg-slate-50/50 dark:bg-slate-900/30">
          <FiUploadCloud className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
          <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
            Drag & drop your .csv file here or browse files
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="mt-2 text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 dark:file:bg-indigo-950 dark:file:text-indigo-400 cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Or Paste CSV Content (name,email,tags)
          </label>
          <textarea
            rows={4}
            value={csvRaw}
            onChange={(e) => setCsvRaw(e.target.value)}
            className="w-full px-3.5 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        {/* Live Parsed Preview */}
        {parsedRows.length > 0 && (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FiFileText className="w-4 h-4 text-indigo-500" />
              <span>Parsed Contacts Preview ({parsedRows.length} contacts found)</span>
            </div>
            <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {parsedRows.map((row, i) => (
                <div key={i} className="p-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white mr-2">
                      {row.name || 'No Name'}
                    </span>
                    <span className="text-slate-500">{row.email}</span>
                  </div>
                  {row.tags && (
                    <span className="text-[10px] bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium">
                      {row.tags}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <SecondaryButton onClick={onClose} disabled={loading}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            onClick={handleImport}
            loading={loading}
            disabled={parsedRows.length === 0}
          >
            Import {parsedRows.length} Contacts
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
}

export default ImportCsvModal;
