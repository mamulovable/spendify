import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Clock, CheckCircle2, AlertCircle, FileStack } from 'lucide-react';

interface DocumentQueueStatusCardsProps {
  queueCounts: Record<string, number>;
  isLoading: boolean;
}

export function DocumentQueueStatusCards({ queueCounts, isLoading }: DocumentQueueStatusCardsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statusCards = [
    {
      title: 'Total Documents',
      value: queueCounts?.total || 0,
      description: 'All documents in the system',
      icon: <FileStack className="h-4 w-4 text-muted-foreground" />,
      color: 'bg-muted/50',
    },
    {
      title: 'Pending',
      value: queueCounts?.pending || 0,
      description: 'Waiting to be processed',
      icon: <Clock className="h-4 w-4 text-amber-500" />,
      color: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      title: 'Processing',
      value: queueCounts?.processing || 0,
      description: 'Currently being processed',
      icon: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
      color: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      title: 'Completed',
      value: queueCounts?.completed || 0,
      description: 'Successfully processed',
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      color: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      title: 'Failed',
      value: queueCounts?.failed || 0,
      description: 'Processing errors',
      icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      color: 'bg-red-50 dark:bg-red-950/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {statusCards.map((card, index) => (
        <Card key={index} className={card.color}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}