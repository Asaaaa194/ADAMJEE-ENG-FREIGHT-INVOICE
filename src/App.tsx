import { useState, useEffect, useRef, useCallback } from 'react';
import { InvoiceRecord } from './types';
import {
  getInvoiceRecord,
  getAllInvoices,
  saveInvoiceRecord,
  deleteInvoiceRecord,
  requestPersistentStorage,
} from './db/indexedDB';
import {
  SAMPLE_SHIPPING_INVOICE,
  createBlankInvoice,
} from './data/sampleInvoices';
import { ShippingInvoiceView } from './components/ShippingInvoiceView';
import { Toolbar } from './components/Toolbar';
import { InvoiceListModal } from './components/InvoiceListModal';
import { BackupModal } from './components/BackupModal';
import { ConfirmModal } from './components/ConfirmModal';
import { exportToPDF } from './utils/pdfGenerator';

export default function App() {
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceRecord>(SAMPLE_SHIPPING_INVOICE);
  const [allInvoices, setAllInvoices] = useState<InvoiceRecord[]>([]);
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('');
  const [storagePersisted, setStoragePersisted] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState<boolean>(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const autoSaveTimerRef = useRef<any>(null);
  const isInitialLoadRef = useRef<boolean>(true);

  // Show a temporary floating toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Check and request persistent storage
  const handleRequestPersistence = useCallback(async () => {
    const res = await requestPersistentStorage();
    setStoragePersisted(res.persisted);
    if (res.persisted) {
      showToast('Persistent Storage is active! Data is permanently safe.');
    } else {
      showToast('Storage persistence requested. Browser policy may apply.');
    }
  }, []);

  // Reload the invoices list from IndexedDB
  const refreshInvoicesList = useCallback(async (activeInvToSelect?: string) => {
    try {
      const records = await getAllInvoices();
      if (records.length === 0) {
        // First run initialization: seed with default records
        await saveInvoiceRecord(SAMPLE_SHIPPING_INVOICE);
        const seeded = await getAllInvoices();
        setAllInvoices(seeded);
        setCurrentInvoice(SAMPLE_SHIPPING_INVOICE);
      } else {
        setAllInvoices(records);
        if (activeInvToSelect) {
          const matched = records.find((r) => r.invNo === activeInvToSelect);
          if (matched) setCurrentInvoice(matched);
        }
      }
    } catch (err) {
      console.error('Failed to load invoices from IndexedDB', err);
    }
  }, []);

  // Initialize DB on mount
  useEffect(() => {
    async function init() {
      await handleRequestPersistence();

      // Check last active invoice from localStorage
      const lastActiveInvNo = localStorage.getItem('fmb_last_active_inv');

      try {
        const records = await getAllInvoices();
        if (records.length === 0) {
          await saveInvoiceRecord(SAMPLE_SHIPPING_INVOICE);
          const seeded = await getAllInvoices();
          setAllInvoices(seeded);
          setCurrentInvoice(SAMPLE_SHIPPING_INVOICE);
        } else {
          setAllInvoices(records);
          let target = records[0];
          if (lastActiveInvNo) {
            const found = records.find((r) => r.invNo === lastActiveInvNo);
            if (found) target = found;
          }
          setCurrentInvoice(target);
        }
      } catch (err) {
        console.error('IndexedDB init error:', err);
      } finally {
        isInitialLoadRef.current = false;
      }
    }

    init();
  }, [handleRequestPersistence]);

  // Debounced Auto-Save trigger
  const triggerAutoSave = useCallback((invoiceToSave: InvoiceRecord) => {
    if (!invoiceToSave.invNo || invoiceToSave.invNo.trim() === '') return;

    clearTimeout(autoSaveTimerRef.current);
    setAutoSaveStatus('Saving...');

    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        await saveInvoiceRecord(invoiceToSave);
        setAutoSaveStatus('✔ Auto-Saved');
        setTimeout(() => setAutoSaveStatus(''), 2000);

        // Update list
        const updatedList = await getAllInvoices();
        setAllInvoices(updatedList);
      } catch (err) {
        console.error('Auto-save error:', err);
        setAutoSaveStatus('⚠️ Save Failed');
      }
    }, 800);
  }, []);

  // Invoice change handler from child components
  const handleInvoiceChange = (updated: InvoiceRecord) => {
    setCurrentInvoice(updated);
    triggerAutoSave(updated);
  };

  // Manual Save
  const handleManualSave = async () => {
    if (!currentInvoice.invNo || currentInvoice.invNo.trim() === '') {
      showToast('Please provide an Invoice Number before saving.');
      return;
    }

    try {
      await saveInvoiceRecord(currentInvoice);
      const updatedList = await getAllInvoices();
      setAllInvoices(updatedList);
      showToast(`Invoice ${currentInvoice.invNo} successfully saved to IndexedDB!`);
    } catch (err) {
      console.error('Manual save failed', err);
      showToast('Failed to save invoice to IndexedDB.');
    }
  };

  // Select Invoice from Dropdown or Modal
  const handleSelectInvoice = async (invNo: string) => {
    try {
      const record = await getInvoiceRecord(invNo);
      if (record) {
        setCurrentInvoice(record);
        showToast(`Loaded invoice: ${invNo}`);
      }
    } catch (err) {
      console.error('Failed to load invoice', err);
    }
  };

  // Create New Blank Invoice
  const handleCreateNewBlank = () => {
    const blank = createBlankInvoice();
    setCurrentInvoice(blank);
    saveInvoiceRecord(blank).then(() => {
      refreshInvoicesList(blank.invNo);
      showToast(`Created new invoice ${blank.invNo}`);
    });
  };

  // Duplicate current invoice with clean numbering
  const handleDuplicateInvoice = (invoiceToDuplicate?: InvoiceRecord) => {
    const source = invoiceToDuplicate || currentInvoice;
    
    // Generate clean next invoice number
    let newInvNo = '';
    const match = source.invNo.match(/^(.*?)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const numStr = match[2];
      let nextNum = parseInt(numStr, 10) + 1;
      newInvNo = `${prefix}${String(nextNum).padStart(numStr.length, '0')}`;
      
      // Ensure unique in allInvoices
      while (allInvoices.some((inv) => inv.invNo === newInvNo)) {
        nextNum++;
        newInvNo = `${prefix}${String(nextNum).padStart(numStr.length, '0')}`;
      }
    } else {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      newInvNo = `${source.invNo}-${randomSuffix}`;
    }

    const duplicated: InvoiceRecord = {
      ...JSON.parse(JSON.stringify(source)),
      invNo: newInvNo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveInvoiceRecord(duplicated).then(() => {
      refreshInvoicesList(newInvNo);
      setCurrentInvoice(duplicated);
      showToast(`Duplicated as ${newInvNo}`);
    });
  };

  // Request deletion confirmation
  const handleDeleteCurrent = () => {
    if (!currentInvoice.invNo) return;
    setInvoiceToDelete(currentInvoice.invNo);
  };

  // Request deletion from modal
  const handleDeleteInvoice = (invNo: string) => {
    setInvoiceToDelete(invNo);
  };

  // Execute confirmed deletion
  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return;
    const invNo = invoiceToDelete;
    setInvoiceToDelete(null);

    try {
      await deleteInvoiceRecord(invNo);
      const remaining = await getAllInvoices();
      setAllInvoices(remaining);

      if (currentInvoice.invNo === invNo) {
        if (remaining.length > 0) {
          setCurrentInvoice(remaining[0]);
        } else {
          const blank = createBlankInvoice();
          await saveInvoiceRecord(blank);
          setAllInvoices([blank]);
          setCurrentInvoice(blank);
        }
      }

      showToast(`Deleted invoice ${invNo}`);
    } catch (err) {
      console.error('Delete error', err);
      showToast(`Failed to delete invoice ${invNo}`);
    }
  };

  const handleAddShippingItem = () => {
    const newItems = [
      ...currentInvoice.shippingItems,
      {
        id: `ship-${Date.now()}`,
        sNo: currentInvoice.shippingItems.length + 1,
        description: 'NEW CHARGES / FREIGHT ITEM',
        qty: 1,
        rate: '0.00',
        amountFC: '0.00',
        amountRS: 0.00,
      },
    ];
    handleInvoiceChange({ ...currentInvoice, shippingItems: newItems });
  };

  const handleRemoveShippingItem = (id: string) => {
    const newItems = currentInvoice.shippingItems.filter((i) => i.id !== id);
    handleInvoiceChange({ ...currentInvoice, shippingItems: newItems });
  };

  // Direct PDF Download Handler
  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    showToast('Generating PDF file, please wait...');
    try {
      const fileName = `Invoice_${currentInvoice.invNo || 'FMB'}.pdf`;
      const success = await exportToPDF('invoice-document-sheet', fileName);
      if (success) {
        showToast(`Downloaded ${fileName} successfully!`);
      } else {
        showToast('PDF export failed. You can use the Print button as fallback.');
      }
    } catch (err) {
      console.error('PDF export error', err);
      showToast('Error exporting PDF.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Application Toolbar */}
      <Toolbar
        currentInvoice={currentInvoice}
        allInvoices={allInvoices}
        activeInvNo={currentInvoice.invNo}
        autoSaveStatus={autoSaveStatus}
        storagePersisted={storagePersisted}
        isDownloadingPDF={isDownloadingPDF}
        onRequestPersistence={handleRequestPersistence}
        onSaveManual={handleManualSave}
        onDownloadPDF={handleDownloadPDF}
        onPrint={handlePrint}
        onAddNewLine={handleAddShippingItem}
        onCreateNewBlank={handleCreateNewBlank}
        onDeleteCurrent={handleDeleteCurrent}
        onDuplicateCurrent={() => handleDuplicateInvoice(currentInvoice)}
        onSelectInvoice={handleSelectInvoice}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
      />

      {/* Main Canvas Area with Geometric Grid Background */}
      <main className="flex-1 geometric-grid-bg py-8 px-4 sm:px-6 flex justify-center items-start overflow-x-auto print:bg-white print:p-0">
        <div className="w-full max-w-[210mm] mx-auto print:max-w-none print:w-full print:p-0">
          <ShippingInvoiceView
            invoice={currentInvoice}
            onChange={handleInvoiceChange}
            onAddItem={handleAddShippingItem}
            onRemoveItem={handleRemoveShippingItem}
          />
        </div>
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-slate-100 px-4 py-2.5 rounded-lg shadow-xl border border-slate-700/80 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* In-App Delete Confirmation Modal (Reliable in iframes) */}
      <ConfirmModal
        isOpen={!!invoiceToDelete}
        title="Delete Invoice"
        message={`Are you sure you want to permanently delete Invoice "${invoiceToDelete}" from IndexedDB?`}
        confirmLabel="Delete Permanently"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setInvoiceToDelete(null)}
      />

      {/* Invoice History Manager Modal */}
      <InvoiceListModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        invoices={allInvoices}
        activeInvNo={currentInvoice.invNo}
        onSelectInvoice={handleSelectInvoice}
        onDeleteInvoice={handleDeleteInvoice}
        onDuplicateInvoice={handleDuplicateInvoice}
      />

      {/* Backup & Restore Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataRestored={() => refreshInvoicesList()}
      />
    </div>
  );
}

