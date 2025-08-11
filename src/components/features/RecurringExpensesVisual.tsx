import { CalendarClock, RefreshCw } from 'lucide-react';

const RecurringExpensesVisual = () => {
  return (
    <div className="w-full h-full bg-gray-800 p-4 rounded-lg text-white font-sans">
      <div className="flex items-center mb-4">
        <CalendarClock className="w-5 h-5 text-blue-400 mr-2" />
        <h3 className="text-md font-bold text-gray-100">Recurring Expenses</h3>
      </div>
      <div className="space-y-3">
        <div className="bg-gray-700/50 p-2 rounded-md">
          <p className="text-sm text-gray-300 mb-2">Upcoming Payments</p>
          <div className="text-xs space-y-1 text-gray-400">
            <div className="flex justify-between">
              <span>Netflix</span>
              <span className="font-mono text-blue-400">$15.99</span>
            </div>
            <div className="flex justify-between">
              <span>Spotify</span>
              <span className="font-mono text-blue-400">$9.99</span>
            </div>
             <div className="flex justify-between">
              <span>Gym Membership</span>
              <span className="font-mono text-blue-400">$40.00</span>
            </div>
          </div>
        </div>
        <div className="bg-gray-700/50 p-2 rounded-md">
          <p className="text-sm text-gray-300 mb-2 flex items-center"><RefreshCw className="w-4 h-4 text-yellow-400 mr-1" /> Forgotten Subscriptions</p>
          <div className="text-xs space-y-1 text-gray-400">
            <div className="flex justify-between">
              <span>Old Streaming Service</span>
              <span className="font-mono text-yellow-400">$7.99</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecurringExpensesVisual;
