import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { SavedAnalysis } from '@/types';
import { ComparisonData } from '@/pages/Compare';

export const generateComparisonPDF = (
  analysis1: SavedAnalysis,
  analysis2: SavedAnalysis,
  comparisonData: ComparisonData[]
) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text('Expense Analysis Comparison', 105, 15, { align: 'center' });
  
  // Add analysis names and dates
  doc.setFontSize(10);
  doc.text(`${analysis1.name} vs ${analysis2.name}`, 105, 25, { align: 'center' });
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 32, { align: 'center' });

  // Add summary table
  (doc as any).autoTable({
    startY: 40,
    head: [['', analysis1.name, analysis2.name, 'Difference']],
    body: [
      [
        'Total Income',
        `$${analysis1.totalIncome.toLocaleString()}`,
        `$${analysis2.totalIncome.toLocaleString()}`,
        `$${Math.abs(analysis1.totalIncome - analysis2.totalIncome).toLocaleString()}`
      ],
      [
        'Total Expenses',
        `$${analysis1.totalExpense.toLocaleString()}`,
        `$${analysis2.totalExpense.toLocaleString()}`,
        `$${Math.abs(analysis1.totalExpense - analysis2.totalExpense).toLocaleString()}`
      ]
    ],
    theme: 'grid'
  });

  // Add category breakdown on new page
  doc.addPage();
  doc.setFontSize(14);
  doc.text('Category Breakdown', 105, 15, { align: 'center' });

  // Add category table
  (doc as any).autoTable({
    startY: 25,
    head: [['Category', analysis1.name, analysis2.name, 'Difference']],
    body: comparisonData.map(item => [
      item.category,
      `$${(item[analysis1.name] as number).toLocaleString()}`,
      `$${(item[analysis2.name] as number).toLocaleString()}`,
      `$${Math.abs((item[analysis1.name] as number) - (item[analysis2.name] as number)).toLocaleString()}`
    ]),
    theme: 'grid'
  });

  return doc;
}; 