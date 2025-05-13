import React from 'react';

interface SummaryCardsProps {
  monthlySpending: number;
  monthlyBudget: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ monthlySpending, monthlyBudget }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-white rounded shadow p-4 flex flex-col">
        <span className="text-gray-500">Monthly Spending</span>
        <span className="text-2xl font-bold">${monthlySpending.toLocaleString()}</span>
      </div>
      <div className="bg-white rounded shadow p-4 flex flex-col">
        <span className="text-gray-500">Monthly Budget</span>
        <span className="text-2xl font-bold">${monthlySpending.toLocaleString()} / ${monthlyBudget.toLocaleString()}</span>
        <span className="text-sm text-gray-400">{Math.round((monthlySpending / monthlyBudget) * 100)}% of budget used</span>
      </div>
    </div>
  );
};

export default SummaryCards;
