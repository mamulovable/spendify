import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface Metric {
  label: string;
  value: string | number;
  change?: number;
  icon?: ReactNode;
  description?: string;
}

interface MetricsCardsProps {
  metrics: Metric[];
  className?: string;
}

export const MetricsCards = ({ metrics, className }: MetricsCardsProps) => {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {metrics.map((metric, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-4 flex flex-col">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{metric.label}</span>
              {metric.icon && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {metric.icon}
                </div>
              )}
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{metric.value}</span>
              {metric.change !== undefined && (
                <span className={`ml-2 text-sm ${metric.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {metric.change >= 0 ? '+' : ''}{metric.change}%
                </span>
              )}
            </div>
            {metric.description && (
              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};