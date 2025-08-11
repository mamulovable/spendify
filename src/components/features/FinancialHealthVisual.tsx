import { HeartPulse, Gauge, TrendingUp, TrendingDown } from 'lucide-react';

const FinancialHealthVisual = () => {
  return (
    <div className="w-full h-full bg-gray-800 p-4 rounded-lg text-white font-sans flex flex-col">
      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-700/50 p-2 rounded-md text-center">
          <p className="text-xs text-gray-400">Health Score</p>
          <p className="text-lg font-bold text-teal-400">78</p>
        </div>
        <div className="bg-gray-700/50 p-2 rounded-md text-center">
          <p className="text-xs text-gray-400">Savings Rate</p>
          <p className="text-lg font-bold">15%</p>
        </div>
        <div className="bg-gray-700/50 p-2 rounded-md text-center">
          <p className="text-xs text-gray-400">Debt Ratio</p>
          <p className="text-lg font-bold text-yellow-400">35%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-grow">
        {/* Health Score Gauge */}
        <div className="bg-gray-700/50 p-3 rounded-md flex flex-col">
          <h4 className="text-sm font-bold mb-2 text-gray-300">Health Score</h4>
          <div className="flex-grow flex items-center justify-center">
             <div className="relative w-32 h-16">
                <div style={{borderWidth: '12px'}} className="absolute bottom-0 left-0 w-full h-full border-gray-600 rounded-t-full border-b-0"></div>
                <div style={{borderWidth: '12px', clipPath: 'path("M 0 16 A 16 16 0 0 1 32 16 L 32 0 A 16 16 0 0 0 0 0 Z")'}} className="absolute bottom-0 left-0 w-full h-full border-teal-400 rounded-t-full border-b-0"></div>
                <div style={{height: '50%', transform: 'rotate(140deg)', left: '26px', bottom: '6px'}} className="absolute bottom-0 w-px bg-white"></div>
                <p className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xl font-bold">78</p>
            </div>
          </div>
        </div>

        {/* Score History Chart */}
        <div className="bg-gray-700/50 p-3 rounded-md flex flex-col">
          <h4 className="text-sm font-bold mb-2 text-gray-300">Score History</h4>
          <div className="flex-grow flex items-center justify-center">
            <svg width="100" height="50" viewBox="0 0 100 50" className="w-full h-full">
              <path d="M 0 40 Q 25 10, 50 30 T 100 20" stroke="#8884d8" fill="none" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialHealthVisual;
