import { HeartPulse, Gauge } from 'lucide-react';

const FinancialHealthVisual = () => {
  return (
    <div className="w-full h-full bg-gray-800 p-4 rounded-lg text-white font-sans">
      <div className="flex items-center mb-4">
        <HeartPulse className="w-5 h-5 text-teal-400 mr-2" />
        <h3 className="text-md font-bold text-gray-100">Financial Health</h3>
      </div>
      <div className="space-y-3">
        <div className="bg-gray-700/50 p-2 rounded-md text-center">
            <p className="text-sm text-gray-300 mb-2 flex items-center justify-center"><Gauge className="w-4 h-4 text-teal-400 mr-1"/> Health Score</p>
            <div className="relative w-24 h-12 mx-auto">
                <div style={{borderWidth: '8px'}} className="absolute bottom-0 left-0 w-full h-full border-teal-400 rounded-t-full border-b-0"></div>
                <div style={{height: '50%', transform: 'rotate(140deg)', left: '26px'}} className="absolute bottom-0 w-px bg-white"></div>
                <p className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-lg font-bold">78</p>
            </div>
        </div>
        <div className="bg-gray-700/50 p-2 rounded-md">
          <p className="text-sm text-gray-300 mb-2">Key Metrics</p>
          <div className="text-xs space-y-1 text-gray-400">
            <div className="flex justify-between">
              <span>Savings Rate</span>
              <span className="font-mono text-teal-400">15%</span>
            </div>
            <div className="flex justify-between">
              <span>Debt-to-Income</span>
              <span className="font-mono text-yellow-400">35%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialHealthVisual;
