import { TrendingUp, TrendingDown, ArrowRight, Minus, Plus } from 'lucide-react';

const CashFlowVisual = () => {
  return (
    <div className="w-full h-full bg-gray-800 p-4 rounded-lg text-white font-sans flex flex-col">
      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-700/50 p-2 rounded-md text-center">
          <p className="text-xs text-gray-400">Total Income</p>
          <p className="text-lg font-bold text-green-400">$6,000</p>
        </div>
        <div className="bg-gray-700/50 p-2 rounded-md text-center">
          <p className="text-xs text-gray-400">Total Expenses</p>
          <p className="text-lg font-bold text-red-400">$4,500</p>
        </div>
        <div className="bg-gray-700/50 p-2 rounded-md text-center">
          <p className="text-xs text-gray-400">Net Flow</p>
          <p className="text-lg font-bold text-green-400">$1,500</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-grow">
        {/* Cash Flow Waterfall Chart */}
        <div className="bg-gray-700/50 p-3 rounded-md flex flex-col">
          <h4 className="text-sm font-bold mb-2 text-gray-300">Income vs Expenses</h4>
          <div className="flex-grow flex items-end justify-around text-xs">
            <div className="text-center">
              <div className="h-24 w-8 bg-green-400/70 rounded-t-sm"></div>
              <p>Income</p>
            </div>
            <div className="text-center">
              <div className="h-16 w-8 bg-red-400/70 rounded-t-sm"></div>
              <p>Housing</p>
            </div>
            <div className="text-center">
              <div className="h-12 w-8 bg-red-400/70 rounded-t-sm"></div>
              <p>Shopping</p>
            </div>
            <div className="text-center">
              <div className="h-20 w-8 bg-green-400/70 rounded-t-sm"></div>
              <p>Net</p>
            </div>
          </div>
        </div>

        {/* Cash Flow Prediction */}
        <div className="bg-gray-700/50 p-3 rounded-md flex flex-col">
          <h4 className="text-sm font-bold mb-2 text-gray-300">Cash Flow Prediction</h4>
           <div className="flex-grow flex flex-col justify-center text-center">
                <p className="text-xs text-gray-400">Next 30 Days</p>
                <p className="text-3xl font-bold text-green-400">+$850</p>
                <p className="text-xs text-gray-400 mt-2">Based on your spending habits, your cash flow is projected to be positive.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowVisual;
