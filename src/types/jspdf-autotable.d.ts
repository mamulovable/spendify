declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  interface AutoTableOptions {
    head?: any[][];
    body?: any[][];
    startY?: number;
    theme?: string;
    styles?: any;
    headStyles?: any;
    margin?: any;
  }

  interface jsPDF {
    autoTable: (options: AutoTableOptions) => void;
  }
} 