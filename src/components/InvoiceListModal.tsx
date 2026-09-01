import React, { useState } from 'react';
import { InvoiceRecord } from '../types';
import { X, Search, FileText, Calendar, Trash2, Copy, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatPKR } from '../utils/numberToWords';

interface InvoiceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: InvoiceRecord[];
  activeInvNo: string;
  onSelectInvoice: (invNo: string) => void;
  onDeleteInvoice: (invNo: string) => void;
  onDuplicateInvoice: (invoice: InvoiceRecord) => void;
}

export const InvoiceListModal: React.FC<InvoiceListModalProps> = ({
  isOpen,
  onClose,
  invoices,
  activeInvNo,
  onSelectInvoice,
  onDeleteInvoice,
  onDuplicateInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = invoices.filter((inv) => {
    const term = searchTerm.toLowerCase();
    const invNo = (inv.invNo || '').toLowerCase();
    const client = (inv.client?.name || '').toLowerCase();
    const bl = (inv.cargo?.blNo || '').toLowerCase();
    const type = (inv.templateType || '').toLowerCase();
    return invNo.includes(term) || client.includes(term) || bl.includes(term) || type.includes(term);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 no-print">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Geometric Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded bg-slate-800 border border-slate-700">
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-xs uppercase tracking-wide text-white">Invoice History Archive</h2>
              <p className="text-[10px] text-slate-400 font-mono-num">Database: FMB_Invoice_Database (IndexedDB)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded p-1 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Stats Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Invoice No, Client Name, BL Number..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold bg-white border border-slate-200 px-2.5 py-1 rounded-md">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{invoices.length} Stored</span>
          </div>
        </div>

        {/* Invoice List */}
        <div className="overflow-y-auto p-4 space-y-2 flex-1 bg-slate-50/50">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No matching invoice records found in persistent storage.
            </div>
          ) : (
            filtered.map((inv) => {
              const isActive = inv.invNo === activeInvNo;
              const isPayOrder = inv.templateType === 'pay_order_advise';

              // Calculate total preview
              const total = (inv.shippingItems || []).reduce((s, i) => s + (parseFloat(String(i.amountRS)) || 0), 0);

              return (
                <div
                  key={inv.invNo}
                  className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-blue-50/80 border-blue-400 shadow-xs ring-1 ring-blue-400'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 tracking-tight font-mono-num">
                        {inv.invNo}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-300">
                        Invoice
                      </span>
                      {isActive && (
                        <span className="text-[9px] font-bold text-blue-800 bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="font-semibold text-xs text-slate-800 mt-1 truncate">
                      {inv.client?.name || 'No Client Name'}
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-slate-500 mt-1 font-mono-num">
                      <span>BL: {inv.cargo?.blNo || '---'}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {inv.updatedAt ? new Date(inv.updatedAt).toLocaleDateString() : inv.date}
                      </span>
                      <span className="font-bold text-slate-950">
                        RS {formatPKR(total)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onDuplicateInvoice(inv)}
                      title="Duplicate this invoice"
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded border border-transparent hover:border-slate-200 cursor-pointer transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteInvoice(inv.invNo)}
                      title="Delete from IndexedDB"
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded border border-transparent hover:border-red-200 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        onSelectInvoice(inv.invNo);
                        onClose();
                      }}
                      className="flex items-center gap-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-md cursor-pointer transition-colors shadow-xs"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-mono-num">
          <span>Target DB: <strong>FMB_Invoice_Database</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md font-semibold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
