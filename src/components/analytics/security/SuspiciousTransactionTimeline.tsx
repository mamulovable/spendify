import { TimelineEvent } from "@/types/securityAlert";
import { AlertTriangle, AlertCircle, AlertOctagon, Info } from "lucide-react";

interface SuspiciousTransactionTimelineProps {
  data: TimelineEvent[];
}

export const SuspiciousTransactionTimeline = ({ data }: SuspiciousTransactionTimelineProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No suspicious transactions detected
      </div>
    );
  }

  const getRiskIcon = (riskLevel: 'low' | 'medium' | 'high' | 'critical') => {
    switch (riskLevel) {
      case 'critical':
        return <AlertOctagon className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-green-500" />;
    }
  };

  const getRiskColor = (riskLevel: 'low' | 'medium' | 'high' | 'critical') => {
    switch (riskLevel) {
      case 'critical':
        return 'border-red-500 bg-red-500/5';
      case 'high':
        return 'border-orange-500 bg-orange-500/5';
      case 'medium':
        return 'border-amber-500 bg-amber-500/5';
      default:
        return 'border-green-500 bg-green-500/5';
    }
  };

  return (
    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
      {data.map((event) => (
        <div 
          key={event.id} 
          className={`p-3 border rounded-md ${getRiskColor(event.riskLevel)}`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-1">
              {getRiskIcon(event.riskLevel)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{event.merchant}</p>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₦{Math.abs(event.amount).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};