import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetricsCards } from "@/components/analytics/shared/MetricsCards";
import { MerchantSpendingHeatmap } from "@/components/analytics/merchant/MerchantSpendingHeatmap";
import { MerchantScatterPlot } from "@/components/analytics/merchant/MerchantScatterPlot";
import { AIInsightsPanel } from "@/components/analytics/shared/AIInsightsPanel";
import { ExportButton } from "@/components/analytics/shared/ExportButton";
import { useMerchantIntelligence } from "@/hooks/useMerchantIntelligence";
import { Loader2, Store, ExternalLink } from "lucide-react";

export const MerchantIntelligenceTab = () => {
  const { 
    merchants, 
    metrics, 
    insights, 
    isLoading 
  } = useMerchantIntelligence();
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Analyzing merchant spending patterns...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            Merchant Intelligence
          </h2>
          <p className="text-muted-foreground">
            Deep dive into your spending at specific merchants and vendors
          </p>
        </div>
        <ExportButton data={merchants} filename="merchant-intelligence" />
      </div>
      
      <MetricsCards metrics={metrics} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Merchant Spending Heatmap</h3>
          <MerchantSpendingHeatmap merchants={merchants} />
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Frequency vs Amount Analysis</h3>
          <MerchantScatterPlot merchants={merchants} />
        </Card>
      </div>
      
      <AIInsightsPanel 
        insights={insights} 
        title="Merchant Insights & Recommendations"
      />
      
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Merchant Opportunities</h3>
        
        {merchants.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No merchant data available for analysis.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Price Comparison Section */}
            <div>
              <h4 className="text-md font-medium mb-3">Price Comparison Suggestions</h4>
              <div className="space-y-4">
                {merchants
                  .filter(merchant => merchant.priceComparisons && merchant.priceComparisons.length > 0)
                  .slice(0, 3)
                  .map(merchant => (
                    <div key={merchant.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h5 className="font-medium">{merchant.name}</h5>
                          <p className="text-sm text-muted-foreground">
                            Average transaction: ₦{merchant.averageTransaction.toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-primary/10">
                          {merchant.category}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {merchant.priceComparisons?.map((comparison, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                            <div>
                              <p className="font-medium">{comparison.competitor}</p>
                              <p className="text-xs text-muted-foreground">Alternative option</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-green-500 font-medium">
                                Save ₦{comparison.potentialSavings.toLocaleString()} ({comparison.savingsPercentage}%)
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                
                {merchants.filter(merchant => merchant.priceComparisons && merchant.priceComparisons.length > 0).length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No price comparison suggestions available.
                  </div>
                )}
              </div>
            </div>
            
            {/* Loyalty Programs Section */}
            <div>
              <h4 className="text-md font-medium mb-3">Loyalty Program Recommendations</h4>
              <div className="space-y-4">
                {merchants
                  .filter(merchant => merchant.loyaltyPrograms && merchant.loyaltyPrograms.length > 0)
                  .slice(0, 3)
                  .map(merchant => (
                    <div key={merchant.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h5 className="font-medium">{merchant.name}</h5>
                          <p className="text-sm text-muted-foreground">
                            Total spent: ₦{merchant.totalSpent.toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-primary/10">
                          {merchant.transactionCount} transactions
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {merchant.loyaltyPrograms?.map((program, index) => (
                          <div key={index} className="p-3 border rounded-md bg-primary/5">
                            <div className="flex justify-between items-start">
                              <div>
                                <h6 className="font-medium">{program.name}</h6>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {program.description}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-green-500 font-medium">
                                  Potential savings: ₦{program.potentialSavings.toLocaleString()}
                                </p>
                                {program.link && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-xs mt-1 h-7 px-2"
                                    onClick={() => window.open(program.link, '_blank')}
                                  >
                                    Learn More <ExternalLink className="ml-1 h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                
                {merchants.filter(merchant => merchant.loyaltyPrograms && merchant.loyaltyPrograms.length > 0).length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No loyalty program recommendations available.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};