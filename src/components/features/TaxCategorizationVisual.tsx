import { Receipt, PieChart, BarChart } from 'lucide-react';

const TaxCategorizationVisual = () => {
  return (
    <div className="w-full h-full bg-gray-800 p-4 rounded-lg text-white font-sans flex flex-col">
      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-700/50 p-2 rounded-md text-center">
          <p className="text-xs text-gray-400">Deductible</p>
          <p className="text-lg font-bold text-indigo-400">$1,250</p>
        </div>
        <div className="bg-gray-700/50 p-2 rounded-md text-center">
          <p className="text-xs text-gray-400">Transactions</p>
          <p className="text-lg font-bold">15</p>
        </div>
        <div className="bg-gray-700/50 p-2 rounded-md text-center">
          <p className="text-xs text-gray-400">Categories</p>
          <p className="text-lg font-bold">4</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-grow">
        {/* Tax Category Pie Chart */}
        <div className="bg-gray-700/50 p-3 rounded-md flex flex-col">
          <h4 className="text-sm font-bold mb-2 text-gray-300">Expense Categories</h4>
          <div className="flex-grow flex items-center justify-center">
             <div className="w-24 h-24 rounded-full" style={{backgroundImage: 'conic-gradient(#6366f1, #ec4899, #f97316)'}}></div>
          </div>
        </div>

        {/* Deductible Expenses Chart */}
        <div className="bg-gray-700/50 p-3 rounded-md flex flex-col">
          <h4 className="text-sm font-bold mb-2 text-gray-300">Deductibles Over Time</h4>
          <div className="flex-grow flex items-end justify-around text-xs">
            <div className="h-12 w-8 bg-indigo-400/70 rounded-t-sm"></div>
            <div className="h-16 w-8 bg-indigo-400/70 rounded-t-sm"></div>
            <div className="h-8 w-8 bg-indigo-400/70 rounded-t-sm"></div>
            <div className="h-20 w-8 bg-indigo-400/70 rounded-t-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxCategorizationVisual;
