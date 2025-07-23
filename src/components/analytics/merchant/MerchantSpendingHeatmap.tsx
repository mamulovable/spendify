import { MerchantData } from "@/types/merchantIntelligence";
import { useState } from "react";

interface MerchantSpendingHeatmapProps {
  merchants: MerchantData[];
}

export const MerchantSpendingHeatmap = ({ merchants }: MerchantSpendingHeatmapProps) => {
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantData | null>(null);

  if (!merchants || merchants.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No merchant data available
      </div>
    );
  }

  // Get top merchants for the heatmap
  const topMerchants = merchants.slice(0, 10);

  // Get quarters for the heatmap
  const quarters = [1, 2, 3, 4];

  // Calculate the maximum spending value for color scaling
  const maxSpending = Math.max(
    ...topMerchants.flatMap(merchant => 
      merchant.seasonalPattern?.map(pattern => pattern.spending) || [0]
    )
  );

  // Function to get color intensity based on spending amount
  const getColorIntensity = (spending: number) => {
    const intensity = Math.min(0.9, Math.max(0.1, spending / maxSpending));
    return `rgba(79, 70, 229, ${intensity})`;
  };

  // Function to format quarter label
  const formatQuarter = (quarter: number) => {
    return `Q${quarter}`;
  };

  // Handle merchant selection
  const handleMerchantClick = (merchant: MerchantData) => {
    setSelectedMerchant(merchant === selectedMerchant ? null : merchant);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-2">Merchant</th>
              {quarters.map(quarter => (
                <th key={quarter} className="p-2 text-center">
                  {formatQuarter(quarter)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topMerchants.map(merchant => (
              <tr 
                key={merchant.id}
                className={`cursor-pointer hover:bg-muted/50 ${selectedMerchant?.id === merchant.id ? 'bg-muted' : ''}`}
                onClick={() => handleMerchantClick(merchant)}
              >
                <td className="p-2 font-medium">{merchant.name}</td>
                {quarters.map(quarter => {
                  const seasonalData = merchant.seasonalPattern?.find(p => p.quarter === quarter);
                  const spending = seasonalData?.spending || 0;
                  
                  return (
                    <td 
                      key={quarter} 
                      className="p-2 text-center"
                      style={{ 
                        backgroundColor: spending > 0 ? getColorIntensity(spending) : 'transparent',
                        color: spending > maxSpending * 0.7 ? 'white' : 'inherit'
                      }}
                    >
                      {spending > 0 ? `₦${spending.toLocaleString()}` : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedMerchant && (
        <div className="mt-4 p-4 border rounded-md">
          <h4 className="font-medium mb-2">{selectedMerchant.name} - Seasonal Analysis</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="font-medium">₦{selectedMerchant.totalSpent.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Transaction Count</p>
              <p className="font-medium">{selectedMerchant.transactionCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Transaction</p>
              <p className="font-medium">₦{selectedMerchant.averageTransaction.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">{selectedMerchant.category}</p>
            </div>
          </div>

          {selectedMerchant.seasonalPattern && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Quarterly Spending</p>
              <div className="grid grid-cols-4 gap-2">
                {selectedMerchant.seasonalPattern.map(pattern => (
                  <div 
                    key={pattern.quarter}
                    className="p-2 rounded-md"
                    style={{ backgroundColor: getColorIntensity(pattern.spending) }}
                  >
                    <p className="text-xs text-center" style={{ color: pattern.spending > maxSpending * 0.7 ? 'white' : 'inherit' }}>
                      {formatQuarter(pattern.quarter)}
                    </p>
                    <p className="text-sm font-medium text-center" style={{ color: pattern.spending > maxSpending * 0.7 ? 'white' : 'inherit' }}>
                      ₦{pattern.spending.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};