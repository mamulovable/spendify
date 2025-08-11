import { ShieldAlert, TrendingUp, ShieldCheck, AlertTriangle, Info } from 'lucide-react';

const ScamAlertsVisual = () => {
  return (
    <div className="w-full h-full bg-gray-800 p-4 rounded-lg text-white font-sans flex flex-col">
      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-700/50 p-2 rounded-md text-center">
          <p className="text-xs text-gray-400">Alerts</p>
          <p className="text-lg font-bold text-red-400">5</p>
        </div>
        <div className="bg-gray-700/50 p-2 rounded-md text-center">
          <p className="text-xs text-gray-400">Reviewed</p>
          <p className="text-lg font-bold">2</p>
        </div>
        <div className="bg-gray-700/50 p-2 rounded-md text-center">
          <p className="text-xs text-gray-400">Risk Score</p>
          <p className="text-lg font-bold text-yellow-400">68</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-grow">
        {/* Risk Level Chart */}
        <div className="bg-gray-700/50 p-3 rounded-md flex flex-col">
          <h4 className="text-sm font-bold mb-2 text-gray-300">Risk Level Assessment</h4>
          <div className="flex-grow flex items-center justify-center">
             <div className="relative w-32 h-16">
                <div style={{borderWidth: '12px'}} className="absolute bottom-0 left-0 w-full h-full border-gray-600 rounded-t-full border-b-0"></div>
                <div style={{borderWidth: '12px', clipPath: 'path("M 0 16 A 16 16 0 0 1 32 16 L 32 0 A 16 16 0 0 0 0 0 Z")'}} className="absolute bottom-0 left-0 w-full h-full border-yellow-400 rounded-t-full border-b-0"></div>
                <div style={{height: '50%', transform: 'rotate(120deg)', left: '18px', bottom: '6px'}} className="absolute bottom-0 w-px bg-white"></div>
                <p className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xl font-bold">68</p>
            </div>
          </div>
        </div>

        {/* Suspicious Activity Timeline */}
        <div className="bg-gray-700/50 p-3 rounded-md flex flex-col">
          <h4 className="text-sm font-bold mb-2 text-gray-300">Suspicious Activity</h4>
          <ul className="space-y-2 text-xs text-gray-400 flex-grow">
            <li className="flex items-start"><AlertTriangle className="w-3 h-3 text-red-400 mr-2 mt-0.5 shrink-0" /><div><span className="font-bold">Unusual Login:</span> New device from unknown location.</div></li>
            <li className="flex items-start"><Info className="w-3 h-3 text-blue-400 mr-2 mt-0.5 shrink-0" /><div><span className="font-bold">Large Transfer:</span> $2,500 to a new recipient.</div></li>
            <li className="flex items-start"><ShieldCheck className="w-3 h-3 text-green-400 mr-2 mt-0.5 shrink-0" /><div><span className="font-bold">Password Change:</span> Security settings updated.</div></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScamAlertsVisual;
