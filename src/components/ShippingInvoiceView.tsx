import React from 'react';
import { InvoiceRecord, ShippingItem } from '../types';
import { EditableText } from './EditableText';
import { numberToPKRWords, formatPKR } from '../utils/numberToWords';
import { Plus, Trash2 } from 'lucide-react';

interface ShippingInvoiceViewProps {
  invoice: InvoiceRecord;
  onChange: (updated: InvoiceRecord) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
}

export const ShippingInvoiceView: React.FC<ShippingInvoiceViewProps> = ({
  invoice,
  onChange,
  onAddItem,
  onRemoveItem,
}) => {
  // Calculate total in RS
  const totalRS = invoice.shippingItems.reduce((sum, item) => {
    const amt =
      typeof item.amountRS === 'number'
        ? item.amountRS
        : parseFloat(String(item.amountRS).replace(/,/g, '')) || 0;
    return sum + amt;
  }, 0);

  const words = numberToPKRWords(totalRS);

  const updateCompany = (key: keyof typeof invoice.company, value: string) => {
    onChange({
      ...invoice,
      company: { ...invoice.company, [key]: value },
    });
  };

  const updateClient = (key: keyof typeof invoice.client, value: string) => {
    onChange({
      ...invoice,
      client: { ...invoice.client, [key]: value },
    });
  };

  const updateCargo = (key: keyof typeof invoice.cargo, value: any) => {
    onChange({
      ...invoice,
      cargo: { ...invoice.cargo, [key]: value },
    });
  };

  const updateItem = (id: string, field: keyof ShippingItem, value: any) => {
    const newItems = invoice.shippingItems.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Auto-calculate amountRS if rate or qty changes and no FC
        if (field === 'rate' || field === 'qty') {
          const qtyNum = parseFloat(String(updated.qty)) || 0;
          const rateNum = parseFloat(String(updated.rate).replace(/,/g, '')) || 0;
          if (qtyNum && rateNum && (!updated.amountRS || updated.amountRS === 0)) {
            updated.amountRS = Math.round(qtyNum * rateNum * 100) / 100;
          }
        }
        return updated;
      }
      return item;
    });

    onChange({
      ...invoice,
      shippingItems: newItems,
    });
  };

  return (
    <div
      id="invoice-document-sheet"
      className="invoice-a4-sheet mx-auto p-6 sm:p-7 flex flex-col justify-between text-[11px] leading-tight text-black border-2 border-black bg-white select-text shadow-sm"
      style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
    >
      {/* Top Main Section */}
      <div className="flex-1 flex flex-col">
        {/* Company Header */}
        <div className="text-center mb-2">
          <h1 className="text-[22px] font-black uppercase tracking-normal m-0 text-black">
            <EditableText
              value={invoice.company.name}
              onChange={(v) => updateCompany('name', v)}
              className="font-black tracking-normal"
            />
          </h1>
          <p className="font-bold text-[9px] mt-1 text-black uppercase">
            <EditableText
              value={invoice.company.address}
              onChange={(v) => updateCompany('address', v)}
            />
          </p>
          <p className="text-[9px] font-bold text-black mt-0.5">
            Tel:{' '}
            <EditableText
              value={invoice.company.phones}
              onChange={(v) => updateCompany('phones', v)}
            />
          </p>
          <p className="text-[9px] font-bold text-black mt-0.5">
            Email:{' '}
            <EditableText
              value={invoice.company.email}
              onChange={(v) => updateCompany('email', v)}
            />
          </p>
        </div>

        {/* Statement Date bar (Clean right alignment) */}
        <div className="flex justify-end items-center text-[10px] font-bold mb-1">
          <div>
            Statement Date :{' '}
            <EditableText
              value={invoice.statementDate || invoice.date}
              onChange={(v) => onChange({ ...invoice, statementDate: v })}
              className="font-bold"
            />
          </div>
        </div>

        {/* INVOICE Title Box */}
        <div className="text-center text-[15px] font-black uppercase tracking-widest py-1 border border-black my-1 bg-white">
          <EditableText
            value={invoice.title || 'INVOICE'}
            onChange={(v) => onChange({ ...invoice, title: v })}
          />
        </div>

        {/* Metadata Grid Table */}
        <table className="w-full border-collapse border border-black text-[9.5px] my-1 table-fixed">
          <tbody>
            {/* Row 1 to 4: Client on Left, Invoice Details on Right */}
            <tr>
              <td colSpan={2} rowSpan={4} className="border border-black p-1.5 align-top w-[54%]">
                <strong className="text-black font-bold">Client : </strong>
                <div className="font-bold text-[10px] mt-0.5">
                  <EditableText
                    value={invoice.client.name}
                    onChange={(v) => updateClient('name', v)}
                    className="font-bold"
                  />
                </div>
                <div className="text-[9px] mt-0.5 text-black leading-tight">
                  <EditableText
                    value={invoice.client.address}
                    onChange={(v) => updateClient('address', v)}
                    multiline
                  />
                </div>
              </td>
              <td className="border border-black px-1.5 py-0.5 font-bold w-[21%]">Invoice No.</td>
              <td className="border border-black px-1.5 py-0.5 font-bold text-black w-[25%]">
                <EditableText
                  value={invoice.invNo}
                  onChange={(v) => onChange({ ...invoice, invNo: v })}
                  className="font-bold"
                />
              </td>
            </tr>
            <tr>
              <td className="border border-black px-1.5 py-0.5 font-bold">Date :</td>
              <td className="border border-black px-1.5 py-0.5">
                <EditableText value={invoice.date} onChange={(v) => onChange({ ...invoice, date: v })} />
              </td>
            </tr>
            <tr>
              <td className="border border-black px-1.5 py-0.5 font-bold">Job No :</td>
              <td className="border border-black px-1.5 py-0.5">
                <EditableText value={invoice.jobNo || '---'} onChange={(v) => onChange({ ...invoice, jobNo: v })} />
              </td>
            </tr>
            <tr>
              <td className="border border-black px-1.5 py-0.5 font-bold">IGM No. :</td>
              <td className="border border-black px-1.5 py-0.5">
                <EditableText
                  value={invoice.cargo.igmNo}
                  onChange={(v) => updateCargo('igmNo', v)}
                />
              </td>
            </tr>

            {/* Row 5: Shipper / Index No */}
            <tr>
              <td colSpan={2} className="border border-black px-1.5 py-0.5">
                <strong className="font-bold">Shipper : </strong>
                <EditableText
                  value={invoice.supplier}
                  onChange={(v) => onChange({ ...invoice, supplier: v })}
                />
              </td>
              <td className="border border-black px-1.5 py-0.5 font-bold">Index No. :</td>
              <td className="border border-black px-1.5 py-0.5">
                <EditableText
                  value={invoice.cargo.indexNo}
                  onChange={(v) => updateCargo('indexNo', v)}
                />
              </td>
            </tr>

            {/* Row 6: BL # & DT / CBM */}
            <tr>
              <td className="border border-black px-1.5 py-0.5 w-[27%]">
                <strong className="font-bold">BL # : </strong>
                <EditableText
                  value={invoice.cargo.blNo}
                  onChange={(v) => updateCargo('blNo', v)}
                  className="font-bold"
                />
              </td>
              <td className="border border-black px-1.5 py-0.5 w-[27%]">
                <strong className="font-bold">DT : </strong>
                <EditableText
                  value={invoice.cargo.blDate}
                  onChange={(v) => updateCargo('blDate', v)}
                />
              </td>
              <td className="border border-black px-1.5 py-0.5 font-bold">CBM :</td>
              <td className="border border-black px-1.5 py-0.5">
                <EditableText
                  value={invoice.cargo.cbm}
                  onChange={(v) => updateCargo('cbm', v)}
                />
              </td>
            </tr>

            {/* Row 7: Vessel & DT / Gross Wt */}
            <tr>
              <td className="border border-black px-1.5 py-0.5">
                <strong className="font-bold">Vessel : </strong>
                <EditableText
                  value={invoice.cargo.vessel}
                  onChange={(v) => updateCargo('vessel', v)}
                />
              </td>
              <td className="border border-black px-1.5 py-0.5">
                <strong className="font-bold">DT : </strong>
                <EditableText
                  value={invoice.cargo.vesselDate}
                  onChange={(v) => updateCargo('vesselDate', v)}
                />
              </td>
              <td className="border border-black px-1.5 py-0.5 font-bold">Gross Wt :</td>
              <td className="border border-black px-1.5 py-0.5">
                <EditableText
                  value={invoice.cargo.grossWt}
                  onChange={(v) => updateCargo('grossWt', v)}
                />
              </td>
            </tr>

            {/* Row 8: Commodity # / Net Wt */}
            <tr>
              <td colSpan={2} className="border border-black px-1.5 py-0.5">
                <strong className="font-bold">Commodity # : </strong>
                <EditableText
                  value={invoice.cargo.description || '---'}
                  onChange={(v) => updateCargo('description', v)}
                />
              </td>
              <td className="border border-black px-1.5 py-0.5 font-bold">Net Wt :</td>
              <td className="border border-black px-1.5 py-0.5">
                <EditableText
                  value={invoice.cargo.netWt}
                  onChange={(v) => updateCargo('netWt', v)}
                />
              </td>
            </tr>

            {/* Row 9: Packages / Origin */}
            <tr>
              <td colSpan={2} className="border border-black px-1.5 py-0.5">
                <strong className="font-bold">Packages : </strong>
                <EditableText
                  value={invoice.cargo.packages}
                  onChange={(v) => updateCargo('packages', v)}
                />
              </td>
              <td className="border border-black px-1.5 py-0.5 font-bold">Origin :</td>
              <td className="border border-black px-1.5 py-0.5">
                <EditableText
                  value={invoice.cargo.origin}
                  onChange={(v) => updateCargo('origin', v)}
                />
              </td>
            </tr>

            {/* Row 10: Containers # / Discharge */}
            <tr>
              <td colSpan={2} className="border border-black px-1.5 py-0.5">
                <strong className="font-bold">Containers # : </strong>
                <EditableText
                  value={invoice.cargo.containerNo || '---'}
                  onChange={(v) => updateCargo('containerNo', v)}
                />
              </td>
              <td className="border border-black px-1.5 py-0.5 font-bold">Discharge :</td>
              <td className="border border-black px-1.5 py-0.5">
                <EditableText
                  value={invoice.cargo.discharge}
                  onChange={(v) => updateCargo('discharge', v)}
                />
              </td>
            </tr>

            {/* Row 11: Machine (GD) / Type */}
            <tr>
              <td colSpan={2} className="border border-black px-1.5 py-0.5">
                {invoice.cargo.machineGd ? (
                  <>
                    <strong className="font-bold">Machine (GD) : </strong>
                    <EditableText
                      value={invoice.cargo.machineGd}
                      onChange={(v) => updateCargo('machineGd', v)}
                    />
                  </>
                ) : null}
              </td>
              <td className="border border-black px-1.5 py-0.5 font-bold">Type :</td>
              <td className="border border-black px-1.5 py-0.5">
                <EditableText
                  value={invoice.cargo.type}
                  onChange={(v) => updateCargo('type', v)}
                />
              </td>
            </tr>

            {/* Row 12: Exch Rate */}
            <tr>
              <td colSpan={2} className="border border-black px-1.5 py-0.5"></td>
              <td colSpan={2} className="border border-black px-1.5 py-0.5 font-bold">
                <span>Exch Rate : </span>
                <EditableText
                  value={invoice.cargo.exchRate}
                  onChange={(v) => updateCargo('exchRate', v)}
                  isNumeric
                  className="font-bold"
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* Line Items Table */}
        <div className="my-1.5">
          <table className="w-full border-collapse border border-black text-[9.5px] table-fixed">
            <thead>
              <tr className="font-bold border-b border-black">
                <th className="no-print border border-black p-1 w-[28px] text-center"></th>
                <th className="border border-black px-1.5 py-1 w-[40px] text-center font-bold">S.No</th>
                <th className="border border-black px-2 py-1 text-center font-bold">Description</th>
                <th className="border border-black px-1.5 py-1 w-[45px] text-center font-bold">Qty</th>
                <th className="border border-black px-1.5 py-1 w-[70px] text-center font-bold">Rate</th>
                <th className="border border-black px-1.5 py-1 w-[90px] text-center font-bold">Amount (FC)</th>
                <th className="border border-black px-1.5 py-1 w-[100px] text-center font-bold">Amount (RS)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.shippingItems.map((item, idx) => (
                <tr key={item.id}>
                  <td className="no-print border border-black p-0.5 text-center">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      title="Remove row"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-0.5 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3 mx-auto" />
                    </button>
                  </td>
                  <td className="border border-black px-1.5 py-1 text-center font-bold">{idx + 1}</td>
                  <td className="border border-black px-2 py-1 font-bold text-left uppercase">
                    <EditableText
                      value={item.description}
                      onChange={(v) => updateItem(item.id, 'description', v)}
                      className="w-full font-bold"
                    />
                  </td>
                  <td className="border border-black px-1.5 py-1 text-center">
                    <EditableText
                      value={item.qty}
                      onChange={(v) => updateItem(item.id, 'qty', v)}
                      isNumeric
                    />
                  </td>
                  <td className="border border-black px-1.5 py-1 text-right">
                    <EditableText
                      value={item.rate}
                      onChange={(v) => updateItem(item.id, 'rate', v)}
                      isNumeric
                    />
                  </td>
                  <td className="border border-black px-1.5 py-1 text-right">
                    <EditableText
                      value={item.amountFC}
                      onChange={(v) => updateItem(item.id, 'amountFC', v)}
                      isNumeric
                    />
                  </td>
                  <td className="border border-black px-1.5 py-1 text-right font-bold text-black">
                    <EditableText
                      value={item.amountRS !== undefined ? formatPKR(item.amountRS) : '0.00'}
                      onChange={(v) => {
                        const num = parseFloat(v.replace(/,/g, '')) || 0;
                        updateItem(item.id, 'amountRS', num);
                      }}
                      isNumeric
                    />
                  </td>
                </tr>
              ))}

              {/* Totals Row */}
              <tr>
                <td className="no-print border border-black"></td>
                <td
                  colSpan={5}
                  className="border border-black px-3 py-1 text-right font-bold text-[10px]"
                >
                  Net Amount
                </td>
                <td className="border border-black px-2 py-1 text-right font-bold text-[10px] text-black">
                  RS {formatPKR(totalRS)}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="no-print mt-1 flex justify-start">
            <button
              onClick={onAddItem}
              className="flex items-center gap-1 text-[9.5px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded px-2 py-0.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3 h-3" /> Add New Item Line
            </button>
          </div>
        </div>

        {/* In Words Box */}
        <div className="border border-black p-1.5 my-2 bg-white">
          <div className="text-[9.5px] font-bold uppercase tracking-tight text-black">
            <span className="font-bold">IN WORDS: </span>
            <span className="font-bold">{words}</span>
          </div>
        </div>

        {/* Signatures & Notes */}
        <div className="mt-4 mb-2 flex justify-between items-end text-[9.5px]">
          <div>
            <div className="font-bold text-[10px]">For : {invoice.company.name}</div>
            <div className="h-10"></div>
            <div className="w-56 border-t border-black pt-1">
              <strong className="font-bold text-[9.5px]">
                <EditableText
                  value={invoice.footer.signatoryTitle}
                  onChange={(v) =>
                    onChange({
                      ...invoice,
                      footer: { ...invoice.footer, signatoryTitle: v },
                    })
                  }
                />
              </strong>
              <p className="text-[8px] text-black mt-0.5 leading-tight">
                <EditableText
                  value={invoice.footer.note}
                  onChange={(v) =>
                    onChange({
                      ...invoice,
                      footer: { ...invoice.footer, note: v },
                    })
                  }
                />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Tear-off Slip Section (Aligned neatly at the bottom) */}
      <div className="mt-2 pt-2">
        <div className="border-t border-dashed border-black pt-1">
          <p className="text-center text-[8px] text-black mb-1">
            Please cut along the line
          </p>
          <div className="flex justify-between items-center text-[9.5px] font-bold px-1 pb-0.5">
            <div>
              BL # :{' '}
              <EditableText
                value={invoice.cargo.blNo}
                onChange={(v) => updateCargo('blNo', v)}
                className="font-bold"
              />
            </div>
            <div>
              Client :{' '}
              <EditableText
                value={invoice.client.name}
                onChange={(v) => updateClient('name', v)}
                className="font-bold"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
