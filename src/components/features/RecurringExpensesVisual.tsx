import { CalendarClock, RefreshCw, AlertCircle, TrendingDown } from 'lucide-react';

const RecurringExpensesVisual = () => {
  return (
    <div className="w-full h-full bg-gray-800 p-4 rounded-lg text-white font-sans flex flex-col">
      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-700/50 p-2 rounded-md text-center">
          <p className="text-xs text-gray-400">Total Monthly</p>
          <p className="text-lg font-bold text-blue-400">$125</p>
        </div>
        <div className="bg-gray-700/50 p-2 rounded-md text-center">
          <p className="text-xs text-gray-400">Subscriptions</p>
          <p className="text-lg font-bold">4</p>
        </div>
        <div className="bg-gray-700/50 p-2 rounded-md text-center">
          <p className="text-xs text-gray-400">Forgotten</p>
          <p className="text-lg font-bold text-yellow-400">1</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-grow">
        {/* Recurring Expenses List */}
        <div className="bg-gray-700/50 p-3 rounded-md flex flex-col">
          <h4 className="text-sm font-bold mb-2 text-gray-300">Your Recurring Expenses</h4>
          <ul className="space-y-2 text-xs text-gray-400 flex-grow">
            <li className="flex justify-between items-center"><span className="flex items-center"><CalendarClock className="w-3 h-3 mr-2" />Netflix</span> <span className="font-mono">$15.99</span></li>
            <li className="flex justify-between items-center"><span className="flex items-center"><CalendarClock className="w-3 h-3 mr-2" />Spotify</span> <span className="font-mono">$9.99</span></li>
            <li className="flex justify-between items-center"><span className="flex items-center"><CalendarClock className="w-3 h-3 mr-2" />Gym</span> <span className="font-mono">$40.00</span></li>
             <li className="flex justify-between items-center text-yellow-400"><span className="flex items-center"><AlertCircle className="w-3 h-3 mr-2" />Old Service</span> <span className="font-mono">$7.99</span></li>
          </ul>
        </div>

        {/* Cost-Saving Alternatives */}
        <div className="bg-gray-700/50 p-3 rounded-md flex flex-col">
          <h4 className="text-sm font-bold mb-2 text-gray-300">Cost-Saving Alternatives</h4>
          <div className="space-y-2 text-xs text-gray-400 flex-grow">
            <div className="bg-gray-600/50 p-2 rounded-md">
                <p className="font-bold">For Spotify:</p>
                <p className="flex items-center"><TrendingDown className="w-3 h-3 text-green-400 mr-2" />Consider the 'Student' plan to save $5/month.</p>
            </div>
             <div className="bg-gray-600/50 p-2 rounded-md">
                <p className="font-bold">For Netflix:</p>
                <p className="flex items-center"><TrendingDown className="w-3 h-3 text-green-400 mr-2" />The 'Standard with ads' plan is $9 cheaper.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecurringExpensesVisual;
