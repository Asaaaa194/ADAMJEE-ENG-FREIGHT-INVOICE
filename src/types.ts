export type InvoiceTemplateType = 'shipping_invoice';

export interface ShippingItem {
  id: string;
  sNo: number;
  description: string;
  qty: number | string;
  rate: number | string;
  amountFC: number | string;
  amountRS: number;
}

export interface TaxDutyItem {
  id: string;
  sNo: number;
  particulars: string;
  rateStr: string;
  amountRs: number;
  sro: string;
}

export interface InvoiceRecord {
  invNo: string; // Key in IndexedDB
  templateType: InvoiceTemplateType;
  title: string;
  createdAt: string;
  updatedAt: string;

  // Company Header
  company: {
    name: string;
    subTitle: string;
    address: string;
    phones: string;
    email: string;
    refNo: string;
  };

  // Header dates & references
  date: string;
  statementDate: string;
  ourRef: string;
  yourRef: string;
  jobNo: string;

  // Client & Entities
  client: {
    name: string;
    address: string;
    attention: string;
  };
  supplier: string;
  from: string;

  // Cargo & Shipping
  cargo: {
    description: string;
    billOfEntry: string;
    unitQty: string;
    hsCode: string;
    vessel: string;
    vesselDate: string;
    lcNo: string;
    igmNo: string;
    igmDate: string;
    indexNo: string;
    machineGd: string;
    blNo: string;
    blDate: string;
    cbm: string;
    grossWt: string;
    netWt: string;
    packages: string;
    origin: string;
    discharge: string;
    containerNo: string;
    type: string; // e.g. LCL / FCL
    exchRate: number | string;
    invoiceUsd: number | string;
    insRs: number | string;
    landingRate: string;
    assessableValueRs: number;
  };

  // Line items
  shippingItems: ShippingItem[];
  taxDutyItems?: TaxDutyItem[];

  // Totals override if needed or calculated
  manualGrandTotal?: number;
  inWords?: string;

  // Footer
  footer: {
    signatoryTitle: string;
    note: string;
    blNo: string;
    clientName: string;
  };
}

