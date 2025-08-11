import { Store, BarChart2 } from 'lucide-react';

const MerchantIntelligenceVisual = () => {
  return (
    <div className="w-full h-full bg-gray-800 p-4 rounded-lg text-white font-sans">
      <div className="flex items-center mb-4">
        <Store className="w-5 h-5 text-purple-400 mr-2" />
        <h3 className="text-md font-bold text-gray-100">Merchant Intelligence</h3>
      </div>
      <div className="space-y-3">
        <div className="bg-gray-700/50 p-2 rounded-md">
          <p className="text-sm text-gray-300 mb-2">Top Merchants</p>
          <div className="text-xs space-y-1 text-gray-400">
            <div className="flex justify-between">
              <span>Amazon</span>
              <span className="font-mono text-purple-400">$1,250</span>
            </div>
            <div className="flex justify-between">
              <span>Walmart</span>
              <span className="font-mono text-purple-400">$800</span>
            </div>
            <div className="flex justify-between">
              <span>Starbucks</span>
              <span className="font-mono text-purple-400">$250</span>
            </div>
          </div>
        </div>
        <div className="bg-gray-700/50 p-2 rounded-md">
          <p className="text-sm text-gray-300 mb-1 flex items-center"><BarChart2 className="w-4 h-4 text-purple-400 mr-1" /> Spending Heatmap</p>
           <div className="w-full h-12 bg-gray-600 rounded-md p-1 flex justify-between">
              <div className="w-1/4 h-full bg-purple-400/30 rounded-sm"></div>
              <div className="w-1/4 h-full bg-purple-400/50 rounded-sm ml-1"></div>
              <div className="w-1/4 h-full bg-purple-400/70 rounded-sm ml-1"></div>
              <div className="w-1/4 h-full bg-purple-400/90 rounded-sm ml-1"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantIntelligenceVisual;
