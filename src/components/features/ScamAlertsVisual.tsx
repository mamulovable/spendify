import { ShieldAlert, TrendingUp } from 'lucide-react';

const ScamAlertsVisual = () => {
  return (
    <div className="w-full h-full bg-gray-800 p-4 rounded-lg text-white font-sans">
      <div className="flex items-center mb-4">
        <ShieldAlert className="w-5 h-5 text-red-400 mr-2" />
        <h3 className="text-md font-bold text-gray-100">Scam Alerts & Security</h3>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center bg-gray-700/50 p-2 rounded-md">
          <p className="text-sm text-gray-300">Overall Risk Level</p>
          <div className="flex items-center">
            <div className="w-20 h-3 bg-gradient-to-r from-green-400 to-red-400 rounded-full mr-2 shadow-inner">
                <div className="w-2/3 h-full bg-transparent border-r-2 border-white"></div>
            </div>
            <p className="text-sm font-bold text-yellow-400">Medium</p>
          </div>
        </div>
        <div className="bg-gray-700/50 p-2 rounded-md">
          <p className="text-sm text-gray-300 mb-2 flex items-center"><TrendingUp className="w-4 h-4 text-red-400 mr-1" /> Suspicious Activity</p>
          <div className="text-xs space-y-1 text-gray-400 pl-2">
            <p>• Unusual login from new device</p>
            <p>• High-risk transaction detected</p>
          </div>
        </div>
        <div className="bg-gray-700/50 p-2 rounded-md">
          <p className="text-sm text-gray-300 mb-2">Flagged Transactions</p>
          <div className="text-xs space-y-1 text-gray-400">
            <div className="flex justify-between">
              <span>Unknown Merchant</span>
              <span className="font-mono text-red-400">$250.00</span>
            </div>
            <div className="flex justify-between">
              <span>Overseas Transaction</span>
              <span className="font-mono text-red-400">$500.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScamAlertsVisual;
