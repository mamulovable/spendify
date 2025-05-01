
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  description?: string;
  value?: string | number;
  icon?: ReactNode;
  className?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  children?: ReactNode;
}

const StatCard = ({
  title,
  description,
  value,
  icon,
  className,
  trend,
  trendValue,
  children
}: StatCardProps) => {
  return (
    <Card className={cn("overflow-hidden transition-all duration-300 hover:shadow-subtle", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {description && (
            <CardDescription className="text-xs">{description}</CardDescription>
          )}
        </div>
        {icon && (
          <div className="rounded-full p-2 bg-muted/30">{icon}</div>
        )}
      </CardHeader>
      <CardContent>
        {value && (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {trend && trendValue && (
          <div className="flex items-center mt-1 text-xs">
            <span
              className={cn(
                "mr-1 rounded-sm px-1 py-0.5",
                trend === "up" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                trend === "down" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
              )}
            >
              {trendValue}
            </span>
            <span className="text-muted-foreground">from last month</span>
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
};

export default StatCard;
