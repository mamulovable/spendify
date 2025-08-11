import { Store, BarChart2, Dot } from 'lucide-react';

const MerchantIntelligenceVisual = () => {
  return (
    <div className="w-full h-full bg-gray-800 p-4 rounded-lg text-white font-sans flex flex-col">
      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-700/50 p-2 rounded-md text-center">
          <p className="text-xs text-gray-400">Top Merchant</p>
          <p className="text-lg font-bold text-purple-400">Amazon</p>
        </div>
        <div className="bg-gray-700/50 p-2 rounded-md text-center">
          <p className="text-xs text-gray-400">High Freq.</p>
          <p className="text-lg font-bold">Starbucks</p>
        </div>
        <div className="bg-gray-700/50 p-2 rounded-md text-center">
          <p className="text-xs text-gray-400">Total Merchants</p>
          <p className="text-lg font-bold">25</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-grow">
        {/* Merchant Spending Heatmap */}
        <div className="bg-gray-700/50 p-3 rounded-md flex flex-col">
          <h4 className="text-sm font-bold mb-2 text-gray-300">Spending Heatmap</h4>
          <div className="flex-grow grid grid-cols-4 gap-1">
            <div className="bg-purple-400/20 rounded-sm"></div>
            <div className="bg-purple-400/40 rounded-sm"></div>
            <div className="bg-purple-400/60 rounded-sm"></div>
            <div className="bg-purple-400/80 rounded-sm"></div>
            <div className="bg-purple-400/30 rounded-sm"></div>
            <div className="bg-purple-400/50 rounded-sm"></div>
            <div className="bg-purple-400/70 rounded-sm"></div>
            <div className="bg-purple-400/90 rounded-sm"></div>
            <div className="bg-purple-400/10 rounded-sm"></div>
            <div className="bg-purple-400/30 rounded-sm"></div>
            <div className="bg-purple-400/50 rounded-sm"></div>
            <div className="bg-purple-400/70 rounded-sm"></div>
          </div>
        </div>

        {/* Frequency vs Amount Scatter Plot */}
        <div className="bg-gray-700/50 p-3 rounded-md flex flex-col">
          <h4 className="text-sm font-bold mb-2 text-gray-300">Frequency vs Amount</h4>
          <div className="flex-grow relative">
            <Dot className="absolute text-purple-400" style={{left: '20%', top: '30%'}} />
            <Dot className="absolute text-purple-400" style={{left: '40%', top: '60%'}} />
            <Dot className="absolute text-purple-400" style={{left: '70%', top: '20%'}} />
            <Dot className="absolute text-purple-400" style={{left: '50%', top: '40%'}} />
            <Dot className="absolute text-purple-400" style={{left: '30%', top: '80%'}} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantIntelligenceVisual;
