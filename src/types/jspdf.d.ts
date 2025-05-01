import 'jspdf-autotable';
import { jsPDF } from 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: {
      startY?: number;
      head?: any[][];
      body?: any[][];
      theme?: string;
      styles?: {
        fontSize?: number;
        cellPadding?: number;
      };
      headStyles?: {
        fillColor?: number[];
      };
    }) => void;
  }
} 