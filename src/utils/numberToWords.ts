/**
 * Automated Number to Words conversion tailored for Pakistan Rupees (PKR)
 * Supports standard Pakistani/South Asian numbering: Crore, Lakh, Thousand, Hundred, and Paisas.
 */

const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const TENS = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

function convertBelowThousand(n: number): string {
  let str = '';
  if (n >= 100) {
    str += ONES[Math.floor(n / 100)] + ' Hundred';
    n %= 100;
    if (n > 0) str += ' and ';
  }
  if (n >= 20) {
    str += TENS[Math.floor(n / 10)];
    if (n % 10 > 0) {
      str += ' ' + ONES[n % 10];
    }
  } else if (n > 0) {
    str += ONES[n];
  }
  return str.trim();
}

/**
 * Converts a number to Pakistani Rupee text format
 * Example: 2324142.25 -> "Rupees Twenty Three Lakh Twenty Four Thousand One Hundred Forty Two and Twenty Five Paisas Only"
 */
export function numberToPKRWords(num: number): string {
  if (isNaN(num) || num === null || num === undefined) {
    return 'Rupees Zero Only';
  }

  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const integerPart = Math.floor(absNum);
  const decimalPart = Math.round((absNum - integerPart) * 100);

  if (integerPart === 0 && decimalPart === 0) {
    return 'Rupees Zero Only';
  }

  let words = '';

  if (integerPart > 0) {
    // Break into Crores, Lakhs, Thousands, Hundreds/Units
    // e.g., 23,24,142
    let remaining = integerPart;

    const crore = Math.floor(remaining / 10000000);
    remaining %= 10000000;

    const lakh = Math.floor(remaining / 100000);
    remaining %= 100000;

    const thousand = Math.floor(remaining / 1000);
    remaining %= 1000;

    const hundredAndBelow = remaining;

    const parts: string[] = [];

    if (crore > 0) {
      parts.push(convertBelowThousand(crore) + ' Crore');
    }
    if (lakh > 0) {
      parts.push(convertBelowThousand(lakh) + ' Lakh');
    }
    if (thousand > 0) {
      parts.push(convertBelowThousand(thousand) + ' Thousand');
    }
    if (hundredAndBelow > 0) {
      parts.push(convertBelowThousand(hundredAndBelow));
    }

    words = parts.join(' ');
  }

  let result = 'Rupees ' + (isNegative ? 'Minus ' : '') + (words || 'Zero');

  if (decimalPart > 0) {
    const paisaWords = convertBelowThousand(decimalPart);
    result += ` and ${paisaWords} Paisas`;
  }

  result += ' Only';

  return result.replace(/\s+/g, ' ').trim();
}

/**
 * Format currency numbers with commas (e.g. 2,324,142.25)
 */
export function formatPKR(num: number | string | undefined): string {
  if (num === undefined || num === null || num === '') return '0.00';
  const val = typeof num === 'number' ? num : parseFloat(String(num).replace(/,/g, ''));
  if (isNaN(val)) return '0.00';
  return val.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
