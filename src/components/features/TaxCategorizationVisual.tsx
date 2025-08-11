import { Receipt, PieChart } from 'lucide-react';

const TaxCategorizationVisual = () => {
  return (
    <div className="w-full h-full bg-gray-800 p-4 rounded-lg text-white font-sans">
      <div className="flex items-center mb-4">
        <Receipt className="w-5 h-5 text-indigo-400 mr-2" />
        <h3 className="text-md font-bold text-gray-100">Tax Categorization</h3>
      </div>
      <div className="space-y-3">
         <div className="bg-gray-700/50 p-2 rounded-md">
          <p className="text-sm text-gray-300 mb-2 flex items-center"><PieChart className="w-4 h-4 text-indigo-400 mr-1" /> Expense Categories</p>
           <div className="w-full h-16 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full" style={{backgroundImage: 'conic-gradient(#6366f1, #ec4899, #f97316)'}}></div>
           </div>
        </div>
        <div className="bg-gray-700/50 p-2 rounded-md">
          <p className="text-sm text-gray-300 mb-2">Potential Deductions</p>
          <div className="text-xs space-y-1 text-gray-400">
            <div className="flex justify-between">
              <span>Home Office</span>
              <span className="font-mono text-indigo-400">$350</span>
            </div>
            <div className="flex justify-between">
              <span>Business Meals</span>
              <span className="font-mono text-indigo-400">$150</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxCategorizationVisual;
