import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

export async function exportToPDF(elementId: string, fileName: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return false;
  }

  try {
    // Generate high-resolution PNG using browser-native SVG foreignObject rendering
    // skipFonts: true prevents html-to-image from accessing cross-origin stylesheet cssRules
    const imgData = await toPng(element, {
      quality: 1,
      pixelRatio: 2.5, // Crisp 2.5x retina print resolution
      backgroundColor: '#ffffff',
      skipFonts: true,
      filter: (node) => {
        if (node instanceof HTMLElement && node.classList.contains('no-print')) {
          return false;
        }
        return true;
      },
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 210; // A4 standard width in mm
    const pdfHeight = 297; // A4 standard height in mm

    // Load rendered image to get dimensions
    const img = new Image();
    img.src = imgData;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // Render cleanly onto a single A4 page without stretching or overflow
    const renderedHeight = (img.naturalHeight * pdfWidth) / img.naturalWidth;
    
    // Fit precisely within standard single A4 page
    const finalHeight = Math.min(renderedHeight, pdfHeight);

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, finalHeight, undefined, 'FAST');

    const safeName = fileName.replace(/[/\\?%*:|"<>]/g, '-');
    pdf.save(safeName.endsWith('.pdf') ? safeName : `${safeName}.pdf`);
    return true;
  } catch (err) {
    console.error('PDF export error:', err);
    return false;
  }
}
