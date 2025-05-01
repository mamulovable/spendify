
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { BankTransaction, ProcessedStatement } from '../services/pdfService';

interface StatementContextType {
  statementData: ProcessedStatement | null;
  uploadedFile: File | null;
  isProcessing: boolean;
  error: string | null;
  setUploadedFile: (file: File | null) => void;
  setStatementData: (data: ProcessedStatement | null) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
  clearData: () => void;
}

const StatementContext = createContext<StatementContextType | undefined>(undefined);

export const StatementProvider = ({ children }: { children: ReactNode }) => {
  const [statementData, setStatementData] = useState<ProcessedStatement | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug logging for context changes
  useEffect(() => {
    console.log("StatementContext - uploadedFile changed:", uploadedFile?.name);
  }, [uploadedFile]);

  useEffect(() => {
    console.log("StatementContext - statementData changed:", 
      statementData ? `${statementData.transactions.length} transactions` : "null");
  }, [statementData]);

  useEffect(() => {
    console.log("StatementContext - isProcessing changed:", isProcessing);
  }, [isProcessing]);

  const clearData = () => {
    console.log("StatementContext - clearing all data");
    setStatementData(null);
    setUploadedFile(null);
    setError(null);
  };

  return (
    <StatementContext.Provider
      value={{
        statementData,
        uploadedFile,
        isProcessing,
        error,
        setUploadedFile,
        setStatementData,
        setIsProcessing,
        setError,
        clearData
      }}
    >
      {children}
    </StatementContext.Provider>
  );
};

export const useStatement = (): StatementContextType => {
  const context = useContext(StatementContext);
  if (context === undefined) {
    throw new Error('useStatement must be used within a StatementProvider');
  }
  return context;
};
