import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { useState } from "react";

export interface Insight {
  title: string;
  description: string;
  actionItems?: string[];
  severity?: "info" | "warning" | "critical";
}

interface AIInsightsPanelProps {
  insights: Insight[];
  className?: string;
  title?: string;
}

export const AIInsightsPanel = ({ 
  insights, 
  className,
  title = "AI-Powered Insights" 
}: AIInsightsPanelProps) => {
  const [expandedInsights, setExpandedInsights] = useState<Record<number, boolean>>({});

  const toggleInsight = (index: number) => {
    setExpandedInsights(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getSeverityColor = (severity?: "info" | "warning" | "critical") => {
    switch (severity) {
      case "critical":
        return "border-red-500/20 bg-red-500/5";
      case "warning":
        return "border-amber-500/20 bg-amber-500/5";
      default:
        return "border-primary/20 bg-primary/5";
    }
  };

  return (
    <Card className={cn("p-6 border-primary/20 bg-primary/5", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <Collapsible 
            key={index} 
            open={expandedInsights[index]} 
            onOpenChange={() => toggleInsight(index)}
            className={cn(
              "border rounded-md p-3", 
              getSeverityColor(insight.severity)
            )}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
                  <h4 className="font-medium">{insight.title}</h4>
                  {expandedInsights[index] ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </CollapsibleTrigger>
              </div>
            </div>
            
            <CollapsibleContent className="mt-2">
              <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
              
              {insight.actionItems && insight.actionItems.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium mb-1">Recommended Actions:</h5>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    {insight.actionItems.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </Card>
  );
};