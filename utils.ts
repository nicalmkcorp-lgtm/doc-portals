import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Returns today's date as a string in YYYY-MM-DD format based on local time.
 */
export const getTodayStr = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Formats a number into a specified currency format.
 */
export const formatCurrency = (amount: number, currencyCode: any = 'PHP'): string => {
  const cleanAmount = typeof amount === 'number' ? amount : Number(amount) || 0;
  let validCode = 'PHP';
  if (typeof currencyCode === 'string' && currencyCode.length === 3) {
    validCode = currencyCode.toUpperCase();
  }
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: validCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(cleanAmount);
  } catch (e) {
    return `P${cleanAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
};

export const formatPHP = (amount: number): string => {
  return formatCurrency(amount, 'PHP');
};

export const addDays = (dateStr: string, days: number): string => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const formatDateShort = (dateStr: string): string => {
  if (!dateStr) return '';
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const month = parseInt(parts[1]);
    const day = parts[2];
    if (isNaN(month) || month < 1 || month > 12) return dateStr;
    return `${String(day).padStart(2, '0')}-${months[month - 1]}-${parts[0]}`;
  } catch (e) {
    return dateStr;
  }
};

export const formatDateDayMonth = (dateStr: string): string => {
  if (!dateStr) return '';
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const month = parseInt(parts[1]);
    const day = parts[2];
    if (isNaN(month) || month < 1 || month > 12) return dateStr;
    return `${String(day).padStart(2, '0')}-${months[month - 1]}`;
  } catch (e) {
    return dateStr;
  }
};

export const formatDateMD = (dateStr: string): string => {
  if (!dateStr) return '';
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    if (isNaN(month) || month < 1 || month > 12) return dateStr;
    return `${months[month - 1]} ${day}`;
  } catch (e) {
    return dateStr;
  }
};

/**
 * Generate a PDF Report using jsPDF.
 */
export const generateReportPDF = (title: string, subtitle: string, columns: any[], data: any[], summary: any[] = []): string => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Enterprise Ledger", 14, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Generated Report", 14, 26);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 36);
  
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100);
    doc.text(subtitle, 14, 42);
    doc.setTextColor(0);
  }

  const tableHead = [columns.map(c => c.header)];
  const tableBody = data.map(row => columns.map(c => {
    const val = c.accessor(row);
    return typeof val === 'object' ? String(val) : val;
  }));

  autoTable(doc, {
    startY: subtitle ? 48 : 42,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  if (summary && summary.length > 0) {
    let currentY = finalY;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 14, currentY);
    currentY += 6;
    summary.forEach(item => {
      doc.setFont("helvetica", "normal");
      doc.text(`${item.label}:`, 14, currentY);
      doc.setFont("helvetica", "bold");
      doc.text(item.value, 60, currentY);
      currentY += 6;
    });
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 10);
  }

  return doc.output('bloburl');
};

/**
 * Shared core logic for Contract PDF generation
 * Strictly follows the visual format of the user samples for both Loan and Rent.
 */
const buildContractDoc = (title: string, content: string, signatureBase64: string | undefined, signerName: string, dateSigned: string | undefined, metaData: any[] = [], authorizedSigner: string = "", authorizedSignatureImage?: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Smaller margins (12.5mm) for wider content area
  const margin = 12.5; 
  const maxLineWidth = pageWidth - (margin * 2);
  // Ensure we wrap strictly within the printable area minus a tiny buffer to prevent overflow
  const wrapWidth = maxLineWidth - 1; 
  
  let cursorY = 15;
  doc.setLineHeightFactor(1.15);
  // Using default char spacing to ensure standard readability (fixes "wide" spacing issue)

  // 1. Header: OFFICIAL AGREEMENT
  doc.setFont("times", "normal");
  doc.setFontSize(8);
  doc.text("OFFICIAL AGREEMENT", pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 2;
  doc.setLineWidth(0.4);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 8;

  // 2. Main Header: [TITLE] (Underlined)
  const displayTitle = (title || "").toUpperCase().trim();
  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.text(displayTitle, pageWidth / 2, cursorY, { align: 'center' });
  const titleWidth = doc.getTextWidth(displayTitle);
  doc.setLineWidth(1);
  doc.line(pageWidth / 2 - titleWidth / 2, cursorY + 2, pageWidth / 2 + titleWidth / 2, cursorY + 2);
  cursorY += 14;

  // 3. Intro Paragraph
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  
  const isRental = title.toLowerCase().includes('rent');
  const lenderObj = metaData.find(m => m.label.toLowerCase().includes('lender') || m.label.toLowerCase().includes('operator'));
  const amountObj = metaData.find(m => m.label.toLowerCase().includes('amount') || m.label.toLowerCase().includes('cost'));
  const lenderName = lenderObj ? lenderObj.value : (authorizedSigner || "---");
  const loanAmount = amountObj ? amountObj.value : "---";
  const roleName = isRental ? 'Renter' : 'Borrower';
  const grantorRole = isRental ? 'Operator' : 'Lender';

  const introText = isRental 
    ? `I, ${signerName}, (hereinafter referred to as the "${roleName}"), hereby agree to the terms and conditions for the rental of the vehicle from ${lenderName} (the "${grantorRole}") for the total sum of ${loanAmount}.`
    : `I, ${signerName}, (hereinafter referred to as the "${roleName}"), hereby acknowledge receipt of the sum of ${loanAmount} from ${lenderName} (the "${grantorRole}") as a financial loan.`;
    
  // Split text using the strictly constrained wrapWidth to prevent overshooting
  const introLines = doc.splitTextToSize(introText, wrapWidth);
  doc.text(introLines, margin, cursorY);
  cursorY += (introLines.length * 5) + 6;

  // 4. Boxed Metadata Section
  const boxTitle = isRental ? 'RENTAL SPECIFICS' : 'LOAN SPECIFICS';
  const boxPadding = 6;
  const labelWidth = 50; 
  const valueWidth = maxLineWidth - labelWidth - (boxPadding * 2);
  const rowSpacing = 5.5;

  let calculatedRowsHeight = 0;
  const processedRows = metaData.map(item => {
    const lines = doc.splitTextToSize(String(item.value), valueWidth);
    const rowH = Math.max(rowSpacing, lines.length * 4.5);
    calculatedRowsHeight += rowH;
    return { label: item.label, valueLines: lines, height: rowH };
  });

  const boxY = cursorY;
  const boxHeight = calculatedRowsHeight + boxPadding + 6;
  
  doc.setDrawColor(200);
  doc.setLineWidth(0.2);
  doc.roundedRect(margin, boxY, maxLineWidth, boxHeight, 4, 4, 'D');
  
  let boxCursorY = boxY + 8;
  doc.setFont("times", "bold");
  doc.setFontSize(9);
  doc.text(boxTitle, margin + boxPadding, boxCursorY);
  boxCursorY += 6;

  processedRows.forEach((row) => {
    doc.setFont("times", "bold");
    doc.text(`${row.label}:`, margin + boxPadding, boxCursorY);
    doc.setFont("times", "normal");
    doc.text(row.valueLines, margin + boxPadding + labelWidth, boxCursorY, { align: 'left' });
    boxCursorY += row.height;
  });

  cursorY += boxHeight + 8;

  // 5. Affirmation Paragraph
  const affirmation = isRental
    ? `I promise to pay the full amount due to the ${grantorRole}. This rental agreement is acknowledged as valid and binding.`
    : `I promise to pay the full amount due to the ${grantorRole}. This debt is acknowledged as valid and binding.`;
    
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  const affLines = doc.splitTextToSize(affirmation, wrapWidth);
  doc.text(affLines, margin, cursorY);
  cursorY += (affLines.length * 5) + 6;

  // 6. Section Header
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.text("TERMS AND CONDITIONS", margin, cursorY);
  cursorY += 6;

  // 7. Content (Terms Text)
  const sigBlockHeight = 55;
  const footerReserved = 10;
  const availableSpaceForTerms = pageHeight - cursorY - sigBlockHeight - footerReserved;
  
  doc.setFont("times", "normal");
  let termsFontSize = 9.5;
  doc.setFontSize(termsFontSize);
  const cleanContent = (content || "").replace(/\t/g, '    ');
  let termsLines = doc.splitTextToSize(cleanContent, wrapWidth);
  
  let estimatedHeight = termsLines.length * (termsFontSize * 0.42);
  if (estimatedHeight > availableSpaceForTerms) {
    termsFontSize = 8.5;
    doc.setFontSize(termsFontSize);
    termsLines = doc.splitTextToSize(cleanContent, wrapWidth);
    estimatedHeight = termsLines.length * (termsFontSize * 0.42);
    
    if (estimatedHeight > availableSpaceForTerms) {
      termsFontSize = 7.5;
      doc.setFontSize(termsFontSize);
      termsLines = doc.splitTextToSize(cleanContent, wrapWidth);
      estimatedHeight = termsLines.length * (termsFontSize * 0.42);
    }
  }

  doc.text(termsLines, margin, cursorY);
  cursorY += estimatedHeight + 8;

  // 8. Signatures
  const sigBlockY = pageHeight - 50; 
  const colWidth = maxLineWidth / 2 - 5;
  const centerLeft = margin + (colWidth / 2);
  const centerRight = pageWidth - margin - (colWidth / 2);

  // Left
  doc.setLineWidth(0.6);
  doc.setDrawColor(0);
  doc.line(margin, sigBlockY + 15, margin + colWidth, sigBlockY + 15);
  doc.setFont("times", "bold");
  doc.setFontSize(9);
  doc.text("AUTHORIZED SIGNATURE", centerLeft, sigBlockY + 20, { align: 'center' });
  if (authorizedSignatureImage) {
    try { doc.addImage(authorizedSignatureImage, 'PNG', centerLeft - 18, sigBlockY - 8, 36, 18); } catch (e) {}
  }
  doc.setFont("times", "normal");
  const authNameWrap = doc.splitTextToSize((lenderName || "Lmk.Corp").toUpperCase(), colWidth);
  doc.text(authNameWrap, centerLeft, sigBlockY + 25, { align: 'center' });

  // Right
  const clientSigLabel = `${roleName.toUpperCase()} SIGNATURE`;
  doc.line(pageWidth - margin - colWidth, sigBlockY + 15, pageWidth - margin, sigBlockY + 15);
  doc.setFont("times", "bold");
  doc.text(clientSigLabel, centerRight, sigBlockY + 20, { align: 'center' });
  if (signatureBase64) {
      try { doc.addImage(signatureBase64, 'PNG', centerRight - 18, sigBlockY - 8, 36, 18); } catch (e) {}
  }
  doc.setFont("times", "normal");
  const signerNameWrap = doc.splitTextToSize(signerName.toUpperCase(), colWidth);
  doc.text(signerNameWrap, centerRight, sigBlockY + 25, { align: 'center' });
  
  if (dateSigned) {
      doc.setFontSize(6.5);
      doc.setFont("times", "italic");
      doc.text(`Signed: ${dateSigned}`, centerRight, sigBlockY + 32, { align: 'center' });
  }

  // 9. Footer
  doc.setFontSize(7);
  doc.setFont("times", "italic");
  doc.setTextColor(160);
  doc.text("Legally Binding Digital Document - Generated by Nica.Lmk.Corp System", pageWidth / 2, pageHeight - 8, { align: 'center' });

  return doc;
};

export const generateContractPDF = (title: string, content: string, signatureBase64: string | undefined, signerName: string, dateSigned: string | undefined, metaData: any[] = [], authorizedSigner: string = "", authorizedSignatureImage?: string) => {
  const doc = buildContractDoc(title, content, signatureBase64, signerName, dateSigned, metaData, authorizedSigner, authorizedSignatureImage);
  const pdfUrl = doc.output('bloburl');
  window.open(pdfUrl, '_blank');
};

/**
 * Returns raw Base64 data for Capacitor sharing
 */
export const generateContractPDFBase64 = (title: string, content: string, signatureBase64: string | undefined, signerName: string, dateSigned: string | undefined, metaData: any[] = [], authorizedSigner: string = "", authorizedSignatureImage?: string): string => {
  const doc = buildContractDoc(title, content, signatureBase64, signerName, dateSigned, metaData, authorizedSigner, authorizedSignatureImage);
  const dataUri = doc.output('datauristring');
  return dataUri.split(',')[1];
};

const getCleanFacebookId = (input: string): string | null => {
  if (!input) return null;
  let val = input.trim();
  if (val.includes('m.me/')) {
     const parts = val.split('m.me/');
     if (parts.length > 1) {
        return parts[1].split(/[?&]/)[0].replace(/\/$/, '').trim();
     }
  }
  if (val.includes('facebook.com') || val.includes('fb.com') || val.includes('messenger.com')) {
    const idMatch = val.match(/[?&]id=(\d+)/);
    if (idMatch) return idMatch[1];
    if (val.includes('/people/')) {
        const peopleMatch = val.match(/\/people\/[^/]+\/(\d+)/);
        if (peopleMatch) return peopleMatch[1];
    }
    if (val.includes('/messages/t/')) {
        const parts = val.split('/messages/t/');
        if (parts.length > 1) {
            return parts[1].split(/[?&]/)[0].replace(/\/$/, '').trim();
        }
    }
    let cleanPath = val.replace(/^(https?:\/\/)?([a-zA-Z0-9-]+\.)?(facebook\.com|fb\.com|messenger\.com)\//, '');
    cleanPath = cleanPath.split(/[?&]/)[0].replace(/\/$/, '');
    if (/^\d+$/.test(cleanPath)) return cleanPath;
    const invalidPaths = ['profile.php', 'messages', 'home', 'friends', 'groups', 'watch', 'marketplace', 'gaming', 'pages', 'media', 'people', 'search', 'events', 'bookmarks', 'notifications', 'settings', 'saved', 'stories', 'share', 'reel', 'reels', 'photo', 'video'];
    const firstSegment = cleanPath.split('/')[0].toLowerCase();
    if (firstSegment && !invalidPaths.includes(firstSegment)) {
        return cleanPath.split('/')[0]; 
    }
  }
  if (/^\d+$/.test(val)) return val;
  if (/^[a-zA-Z0-9.]+$/.test(val)) return val;
  return null;
};

export const openFacebook = (input: string) => {
  if (!input) return;
  const val = input.trim();
  if (val.includes('/share/') || val.includes('/reel/')) {
    window.open(val, '_system');
    return;
  }
  const id = getCleanFacebookId(val);
  if (id) {
    const isNumeric = /^\d+$/.test(id);
    const webUrl = isNumeric 
      ? `https://www.facebook.com/profile.php?id=${id}` 
      : `https://www.facebook.com/${id}`;
    window.open(webUrl, '_system');
    return;
  }
  const searchUrl = `https://www.facebook.com/search/top/?q=${encodeURIComponent(val)}`;
  window.open(searchUrl, '_system');
};

export const openMessenger = (input: string) => {
  if (!input) return;
  const id = getCleanFacebookId(input);
  if (id) {
    if (/^\d+$/.test(id)) {
        window.open(`fb-messenger://user/${id}`, '_system');
    } else {
        window.open(`https://m.me/${id}`, '_system');
    }
  } else {
    window.open('https://m.me/', '_system');
  }
};

export const openSMS = (number: string) => {
  if (!number) return;
  const cleanNumber = number.toString().replace(/\D/g, '');
  window.open(`sms:${cleanNumber}`, '_system');
};