import React from 'react';
import { BankStatementUpload } from '@/components/BankStatementUpload';

export default function Transactions() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Transactions</h1>
      <BankStatementUpload />
    </div>
  );
} 