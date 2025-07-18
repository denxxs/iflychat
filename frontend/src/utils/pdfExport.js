// Enhanced, working, clean pdfexport.js for your Chat markdown + tables export without formatting breakage
// Uses jsPDF + jspdf-autotable for reliable table rendering with clear markdown parsing

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Clean and normalize text for PDF
const cleanText = (text) => {
  if (!text) return '';
  return text
    .replace(/[\u00B9\u00B2\u00B3\u00BC\u00BD\u00BE]/g, '')
    .replace(/[\u00C0-\u00C6]/g, 'A')
    .replace(/[\u00E0-\u00E6]/g, 'a')
    .replace(/[\u00C8-\u00CB]/g, 'E')
    .replace(/[\u00E8-\u00EB]/g, 'e')
    .replace(/[\u00CC-\u00CF]/g, 'I')
    .replace(/[\u00EC-\u00EF]/g, 'i')
    .replace(/[\u00D2-\u00D6\u00D8]/g, 'O')
    .replace(/[\u00F2-\u00F6\u00F8]/g, 'o')
    .replace(/[\u00D9-\u00DC]/g, 'U')
    .replace(/[\u00F9-\u00FC]/g, 'u')
    .replace(/[\u00DD\u0178]/g, 'Y')
    .replace(/[\u00FD\u00FF]/g, 'y')
    .replace(/[\u00D1\u00F1]/g, 'N')
    .replace(/[\u00C7\u00E7]/g, 'C')
    .replace(/[\u00D0\u00F0]/g, 'D')
    .replace(/[\u00DE\u00FE]/g, 'TH')
    .replace(/\u00DF/g, 'ss')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u2022/g, '* ')
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€"/g, '-')
    .replace(/â€¢/g, '* ')
    .replace(/[^\x00-\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\u00A0/g, ' ')
    .trim();
};

// Parse table from markdown
const parseMarkdownTable = (text) => {
  const lines = text.split('\n').filter(line => line.trim().includes('|'));
  if (lines.length < 2) return null;
  
  const headerLine = lines[0];
  const headers = headerLine.split('|')
    .map(cell => cleanText(cell.trim()))
    .filter(cell => cell.length > 0);
  
  if (headers.length === 0) return null;
  
  const dataRows = lines.slice(2).map(line => 
    line.split('|')
      .map(cell => cleanText(cell.trim()))
      .filter(cell => cell.length > 0)
  ).filter(row => row.length > 0);
  
  return { headers, rows: dataRows };
};

// Add markdown content to PDF with proper formatting
const addMarkdownToPdf = (doc, markdown, startY, maxWidth = 170) => {
  if (!markdown) return startY;
  
  let currentY = startY;
  const lines = markdown.split('\n');
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Skip empty lines but add some spacing
    if (!line) {
      currentY += 3;
      i++;
      continue;
    }
    
    // Check for tables
    if (line.includes('|') && lines[i + 1] && lines[i + 1].includes('|')) {
      // Find all table lines
      let tableLines = [];
      let j = i;
      while (j < lines.length && lines[j].trim().includes('|')) {
        tableLines.push(lines[j]);
        j++;
      }
      
      // Parse and render table
      const tableData = parseMarkdownTable(tableLines.join('\n'));
      if (tableData) {
        // Check if table fits on page
        if (currentY > 240) {
          doc.addPage();
          currentY = 20;
        }
        
        autoTable(doc, {
          head: [tableData.headers],
          body: tableData.rows,
          startY: currentY,
          theme: 'striped',
          styles: { 
            fontSize: 9,
            cellPadding: 3
          },
          headStyles: { 
            fillColor: [240, 240, 240], 
            textColor: [0, 0, 0], 
            fontStyle: 'bold' 
          },
          alternateRowStyles: {
            fillColor: [252, 252, 252]
          },
          margin: { left: 20, right: 20 }
        });
        
        currentY = doc.lastAutoTable.finalY + 10;
      }
      
      i = j;
      continue;
    }
    
    // Handle headers
    if (line.startsWith('### ')) {
      const text = cleanText(line.replace('### ', ''));
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
      
      const wrappedLines = doc.splitTextToSize(text, maxWidth);
      doc.text(wrappedLines, 20, currentY);
      currentY += wrappedLines.length * 8 + 6;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
    }
    else if (line.startsWith('## ')) {
      const text = cleanText(line.replace('## ', ''));
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
      
      const wrappedLines = doc.splitTextToSize(text, maxWidth);
      doc.text(wrappedLines, 20, currentY);
      currentY += wrappedLines.length * 8 + 6;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
    }
    else if (line.startsWith('# ')) {
      const text = cleanText(line.replace('# ', ''));
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
      
      const wrappedLines = doc.splitTextToSize(text, maxWidth);
      doc.text(wrappedLines, 20, currentY);
      currentY += wrappedLines.length * 8 + 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
    }
    // Handle lists
    else if (line.match(/^\s*[-*+]\s/)) {
      const text = cleanText(line.replace(/^\s*[-*+]\s/, '• '));
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
      
      const wrappedLines = doc.splitTextToSize(text, maxWidth - 10);
      doc.text(wrappedLines, 25, currentY);
      currentY += wrappedLines.length * 6 + 2;
    }
    // Handle numbered lists
    else if (line.match(/^\s*\d+\.\s/)) {
      const text = cleanText(line.replace(/^\s*\d+\.\s/, '• '));
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
      
      const wrappedLines = doc.splitTextToSize(text, maxWidth - 10);
      doc.text(wrappedLines, 25, currentY);
      currentY += wrappedLines.length * 6 + 2;
    }
    // Handle regular paragraphs
    else {
      let text = cleanText(line);
      // Remove markdown formatting
      text = text
        .replace(/\*\*(.*?)\*\*/g, '$1')  // Bold
        .replace(/\*(.*?)\*/g, '$1')      // Italic
        .replace(/`(.*?)`/g, '"$1"')      // Code
        .replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Links
      
      if (text) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }
        
        const wrappedLines = doc.splitTextToSize(text, maxWidth);
        doc.text(wrappedLines, 20, currentY);
        currentY += wrappedLines.length * 6 + 4;
      }
    }
    
    i++;
  }
  
  return currentY;
};

// Add footer with branding and page numbers
const addFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text('Powered by Hapticware', 20, doc.internal.pageSize.height - 10);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 10);
  }
  doc.setTextColor(0, 0, 0);
};

// Main PDF export function
export const exportChatToPdf = async (chat, messages) => {
  try {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(2, 41, 92);
    const title = cleanText(chat.title || 'Chat Conversation');
    doc.text(title, 20, 25);
    doc.setDrawColor(2, 41, 92);
    doc.setLineWidth(0.5);
    doc.line(20, 28, pageWidth - 20, 28);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const date = new Date().toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generated on ${date}`, 20, 35);

    let currentY = 50;

    // Process each message
    for (const message of messages) {
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }

      // Add separator line between messages
      if (currentY > 50) {
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.1);
        doc.line(20, currentY - 3, pageWidth - 20, currentY - 3);
        doc.setDrawColor(0, 0, 0);
        currentY += 5;
      }

      // Sender label
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      if (message.type === 'user') {
        doc.setTextColor(250, 102, 32);
        doc.text('USER', 20, currentY);
      } else {
        doc.setTextColor(2, 41, 92);
        doc.text('INDIFLY AI', 20, currentY);
      }
      currentY += 12;

      // Message content with markdown
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      currentY = addMarkdownToPdf(doc, message.content || '', currentY);

      // Attachment if present
      if (message.fileName) {
        const fileText = `Attachment: ${cleanText(message.fileName)}`;
        const lines = doc.splitTextToSize(fileText, pageWidth - 40);
        if (currentY + lines.length * 6 > 280) {
          doc.addPage();
          currentY = 20;
        }
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'italic');
        doc.text(lines, 25, currentY);
        currentY += lines.length * 6 + 4;
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
      }
      currentY += 10;
    }

    addFooter(doc);

    const filename = `${(chat.title || 'chat').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);

    return { success: true, filename };
  } catch (err) {
    console.error('PDF Export Error:', err);
    return { success: false, error: err.message };
  }
};