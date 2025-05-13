import React from 'react';

interface Transaction {
  id: number | string;
  description: string;
  category: string;
  amount: number;
  date: string;
  user_id?: string;
  receipt?: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  return (
    <div className="bg-white rounded shadow p-4 mb-6">
      <span className="text-gray-500">Recent Transactions</span>
      <ul className="mt-2">
        {transactions.slice(0, 5).map((tx) => (
          <li key={tx.id} className="flex justify-between py-2 border-b last:border-b-0">
            <span>
              <span className="font-medium">{tx.description}</span>
              <span className="text-xs text-gray-400 ml-2">({tx.category})</span>
            </span>
            <span className="text-right">
              <span className="font-semibold">${tx.amount.toFixed(2)}</span>
              <span className="block text-xs text-gray-400">{tx.date}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentTransactions;
