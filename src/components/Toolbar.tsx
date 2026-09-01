import React from 'react';
import { InvoiceRecord } from '../types';
import {
  Save,
  Printer,
  Plus,
  Trash2,
  FilePlus,
  History,
  HardDrive,
  Database,
  Copy,
  CheckCircle2,
  Download,
  Loader2,
} from 'lucide-react';

interface ToolbarProps {
  currentInvoice: InvoiceRecord;
  allInvoices: InvoiceRecord[];
  activeInvNo: string;
  autoSaveStatus: string;
  storagePersisted: boolean;
  isDownloadingPDF?: boolean;
  onRequestPersistence: () => void;
  onSaveManual: () => void;
  onDownloadPDF: () => void;
  onPrint: () => void;
  onAddNewLine: () => void;
  onCreateNewBlank: () => void;
  onDeleteCurrent: () => void;
  onDuplicateCurrent: () => void;
  onSelectInvoice: (invNo: string) => void;
  onOpenHistoryModal: () => void;
  onOpenBackupModal: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  allInvoices,
  activeInvNo,
  autoSaveStatus,
  storagePersisted,
  isDownloadingPDF,
  onRequestPersistence,
  onSaveManual,
  onDownloadPDF,
  onPrint,
  onAddNewLine,
  onCreateNewBlank,
  onDeleteCurrent,
  onDuplicateCurrent,
  onSelectInvoice,
  onOpenHistoryModal,
  onOpenBackupModal,
}) => {
  return (
    <header className="no-print bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-sm">
      {/* Top Banner / Precision System Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 text-xs">
        {/* Brand & Storage Persistence Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-800 text-white font-black px-2.5 py-1 rounded border border-slate-700 tracking-wider text-xs">
              <span className="w-2 h-2 rounded-xs bg-blue-500"></span>
              <span>F.M BROTHERS</span>
            </div>
            <span className="font-semibold text-slate-400 text-xs hidden sm:inline">
              Invoice & Customs Clearing System
            </span>
          </div>

          {/* Storage Persistence Status */}
          <button
            onClick={onRequestPersistence}
            title="Browser persistent storage ensures records are NEVER cleared during cache cleanup."
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer border ${
              storagePersisted
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/60'
                : 'bg-amber-950/60 text-amber-300 border-amber-700/60 hover:bg-amber-900/60'
            }`}
          >
            <HardDrive className={`w-3 h-3 ${storagePersisted ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>{storagePersisted ? 'IndexedDB: Persisted (Safe)' : 'Enable Persistent Storage'}</span>
          </button>
        </div>

        {/* Auto Save Status & Backup */}
        <div className="flex items-center gap-2.5">
          {autoSaveStatus && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              {autoSaveStatus}
            </span>
          )}

          <button
            onClick={onOpenBackupModal}
            className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md px-2.5 py-1 transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Backup / Restore</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Controls Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left Side: History Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* History Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/90 rounded-lg px-2.5 py-1">
            <History className="w-3.5 h-3.5 text-slate-400" />
            <label htmlFor="toolbarInvoiceHistory" className="text-slate-300 font-medium text-[11px] hidden md:inline">
              History:
            </label>
            <select
              id="toolbarInvoiceHistory"
              value={activeInvNo}
              onChange={(e) => {
                if (e.target.value) onSelectInvoice(e.target.value);
              }}
              className="bg-slate-900 text-white text-xs font-semibold rounded px-2 py-1 outline-none border border-slate-700 cursor-pointer max-w-[200px] sm:max-w-[260px] truncate"
            >
              <option value="">-- Select Saved Invoice --</option>
              {allInvoices.map((inv) => (
                <option key={inv.invNo} value={inv.invNo}>
                  {inv.invNo} - {inv.client?.name ? inv.client.name.slice(0, 22) : 'No client'}
                </option>
              ))}
            </select>
            <button
              onClick={onOpenHistoryModal}
              title="View all saved invoices in manager"
              className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold px-1.5 py-0.5 rounded hover:bg-slate-700 cursor-pointer transition-colors"
            >
              All ({allInvoices.length})
            </button>
          </div>
        </div>

        {/* Right Side: Action Buttons Cluster */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Add Line */}
          <button
            onClick={onAddNewLine}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-md shadow-xs transition-colors cursor-pointer text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Line</span>
          </button>

          {/* Save Button */}
          <button
            onClick={onSaveManual}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-md shadow-xs transition-colors cursor-pointer text-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>

          {/* Duplicate Button */}
          <button
            onClick={onDuplicateCurrent}
            title="Duplicate current invoice"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-medium rounded-md transition-colors cursor-pointer text-xs"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Duplicate</span>
          </button>

          {/* New Blank Button */}
          <button
            onClick={() => onCreateNewBlank()}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium rounded-md transition-colors cursor-pointer text-xs"
          >
            <FilePlus className="w-3.5 h-3.5 text-amber-400" />
            <span>New</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={onDeleteCurrent}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-800/80 font-medium rounded-md transition-colors cursor-pointer text-xs"
            title="Delete this invoice from IndexedDB"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={onDownloadPDF}
            disabled={isDownloadingPDF}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold rounded-md shadow-xs transition-all cursor-pointer text-xs ring-1 ring-blue-400/40"
            title="Generate and download high-resolution PDF file directly"
          >
            {isDownloadingPDF ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isDownloadingPDF ? 'Exporting...' : 'Download PDF'}</span>
          </button>

          {/* Print / System Dialog */}
          <button
            onClick={onPrint}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-md transition-colors cursor-pointer text-xs"
            title="Open browser print preview dialog"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>Print</span>
          </button>
        </div>
      </div>
    </header>
  );
};

