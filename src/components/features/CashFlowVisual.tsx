import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

const CashFlowVisual = () => {
  return (
    <div className="w-full h-full bg-gray-800 p-4 rounded-lg text-white font-sans">
      <div className="flex items-center mb-4">
        <TrendingUp className="w-5 h-5 text-green-400 mr-2" />
        <h3 className="text-md font-bold text-gray-100">Cash Flow Analysis</h3>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md text-sm">
            <span className="flex items-center text-green-400"><TrendingUp className="w-4 h-4 mr-1"/> Income</span>
            <span className="font-mono text-gray-100">$6,000</span>
        </div>
         <div className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md text-sm">
            <span className="flex items-center text-red-400"><TrendingDown className="w-4 h-4 mr-1"/> Expenses</span>
            <span className="font-mono text-gray-100">$4,500</span>
        </div>
        <div className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md text-sm">
            <span className="flex items-center text-blue-400"><ArrowRight className="w-4 h-4 mr-1"/> Net Cash Flow</span>
            <span className="font-mono text-green-400">$1,500</span>
        </div>
        <div className="bg-gray-700/50 p-2 rounded-md">
            <p className="text-sm text-gray-300 mb-1">Cash Flow Trend</p>
            <div className="w-full h-10 bg-gray-600 rounded-md p-1">
                <div className="w-full h-full flex items-end">
                    <div className="w-1/4 h-1/2 bg-green-400/70 rounded-t-sm"></div>
                    <div className="w-1/4 h-3/4 bg-green-400/70 rounded-t-sm ml-1"></div>
                    <div className="w-1/4 h-1/2 bg-red-400/70 rounded-t-sm ml-1"></div>
                    <div className="w-1/4 h-full bg-green-400/70 rounded-t-sm ml-1"></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowVisual;
