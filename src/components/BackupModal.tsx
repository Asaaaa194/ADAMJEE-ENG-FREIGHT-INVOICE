import React, { useState } from 'react';
import { Download, Upload, Copy, Check, X, AlertCircle } from 'lucide-react';
import { exportInvoicesJSON, importInvoicesJSON } from '../db/indexedDB';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setLoading(true);
      const data = await exportInvoicesJSON();
      setJsonText(data);

      // Trigger automatic file download
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FMB_Invoices_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setImportStatus('Backup downloaded successfully!');
    } catch (err: any) {
      setErrorStatus(err.message || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!jsonText) return;
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = async () => {
    if (!jsonText.trim()) {
      setErrorStatus('Please paste JSON data or select a backup file first.');
      return;
    }

    try {
      setLoading(true);
      setErrorStatus(null);
      const count = await importInvoicesJSON(jsonText);
      setImportStatus(`Successfully restored ${count} invoice(s) into IndexedDB!`);
      onDataRestored();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorStatus(`Import failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      setErrorStatus(null);
      setImportStatus(`Loaded file: ${file.name}`);
    };
    reader.onerror = () => {
      setErrorStatus('Error reading file');
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 no-print">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Geometric Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded bg-slate-800 border border-slate-700">
              <Download className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-xs uppercase tracking-wide text-white">Database Backup & Recovery</h2>
              <p className="text-[10px] text-slate-400 font-mono-num">JSON Import / Export (IndexedDB)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded p-1 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-700">
          <p className="text-slate-600 leading-relaxed">
            All your invoices are stored permanently in browser-native <strong>IndexedDB (FMB_Invoice_Database)</strong> with persistent storage enabled. You can export complete JSON backups or restore previous records anytime.
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleExport}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-md shadow-xs cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" /> Export & Download JSON
            </button>
            <label className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-md border border-slate-300 shadow-xs cursor-pointer transition-colors text-center">
              <Upload className="w-4 h-4" /> Select Backup File
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-semibold text-slate-800 text-xs">
                Backup JSON Content / Direct Paste:
              </label>
              {jsonText && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Paste exported invoice JSON here or click Export above..."
              className="w-full h-36 font-mono text-[10px] p-3 bg-slate-50 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 resize-none text-slate-900 leading-relaxed font-mono-num"
            />
          </div>

          {importStatus && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-900 font-medium flex items-center gap-2 text-xs">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}

          {errorStatus && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-900 font-medium flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorStatus}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-300 hover:bg-slate-100 rounded-md font-semibold text-slate-700 cursor-pointer text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={loading || !jsonText.trim()}
            className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-md font-semibold cursor-pointer text-xs shadow-xs transition-colors"
          >
            Restore Invoices to Database
          </button>
        </div>
      </div>
    </div>
  );
};
