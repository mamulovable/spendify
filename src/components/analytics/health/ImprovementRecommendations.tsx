import { FinancialRecommendation } from "@/types/financialHealth";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Wallet, 
  TrendingUp, 
  CreditCard, 
  DollarSign, 
  LineChart 
} from "lucide-react";

interface ImprovementRecommendationsProps {
  recommendations: FinancialRecommendation[];
}

export const ImprovementRecommendations = ({ 
  recommendations 
}: ImprovementRecommendationsProps) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No improvement recommendations available.
      </div>
    );
  }

  // Sort recommendations by impact (highest first)
  const sortedRecommendations = [...recommendations].sort((a, b) => b.impact - a.impact);

  // Get icon for recommendation category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'savings':
        return <Wallet className="h-4 w-4" />;
      case 'debt':
        return <CreditCard className="h-4 w-4" />;
      case 'spending':
        return <DollarSign className="h-4 w-4" />;
      case 'income':
        return <TrendingUp className="h-4 w-4" />;
      case 'investment':
        return <LineChart className="h-4 w-4" />;
      default:
        return <Wallet className="h-4 w-4" />;
    }
  };

  // Get color for recommendation category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'savings':
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case 'debt':
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case 'spending':
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case 'income':
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case 'investment':
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  // Get color for difficulty level
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case 'medium':
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case 'hard':
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-4">
      {sortedRecommendations.map((recommendation, index) => (
        <div 
          key={index} 
          className="border rounded-lg p-4"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-full ${getCategoryColor(recommendation.category)}`}>
                {getCategoryIcon(recommendation.category)}
              </div>
              <div>
                <h4 className="font-medium">{recommendation.description}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className={getCategoryColor(recommendation.category)}
                  >
                    {recommendation.category.charAt(0).toUpperCase() + recommendation.category.slice(1)}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={getDifficultyColor(recommendation.difficulty)}
                  >
                    {recommendation.difficulty.charAt(0).toUpperCase() + recommendation.difficulty.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium">+{recommendation.impact} points</span>
            </div>
          </div>
          
          <div className="mt-2">
            <div className="flex justify-between items-center text-xs mb-1">
              <span>Impact</span>
              <span>{recommendation.impact}/25</span>
            </div>
            <Progress 
              value={(recommendation.impact / 25) * 100} 
              className="h-2"
            />
          </div>
        </div>
      ))}
    </div>
  );
};