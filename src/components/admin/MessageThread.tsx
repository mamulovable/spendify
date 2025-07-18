import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { TicketMessage } from '@/types/supportTicket';
import { cn } from '@/lib/utils';

interface MessageThreadProps {
  messages: TicketMessage[];
  isLoading?: boolean;
}

export function MessageThread({ messages, isLoading = false }: MessageThreadProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-muted"></div>
            <div className="flex-1">
              <div className="h-4 w-24 bg-muted rounded mb-2"></div>
              <div className="h-16 bg-muted rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No messages in this conversation yet.</p>
      </div>
    );
  }

  // Function to format date
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Group messages by date
  const groupedMessages: { [key: string]: TicketMessage[] } = {};
  messages.forEach((message) => {
    const date = new Date(message.created_at).toLocaleDateString();
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  return (
    <div className="space-y-6">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>

          {dateMessages.map((message) => (
            <div key={message.id} className="flex items-start gap-3">
              <Avatar className={cn(
                "h-10 w-10",
                message.sender_type === 'admin' ? "bg-primary text-primary-foreground" : 
                message.sender_type === 'user' ? "bg-muted" : "bg-secondary"
              )}>
                <AvatarFallback>
                  {message.sender_type === 'admin' ? 'A' : 
                   message.sender_type === 'user' ? 'U' : 'S'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {message.sender_name || 
                     (message.sender_type === 'admin' ? 'Admin' : 
                      message.sender_type === 'user' ? 'User' : 'System')}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatMessageDate(message.created_at)}
                  </span>
                </div>
                <Card className="mt-1">
                  <CardContent className="p-3 text-sm whitespace-pre-wrap">
                    {message.content}
                  </CardContent>
                </Card>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.attachments.map((attachment, index) => (
                      <a 
                        key={index}
                        href={attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Attachment {index + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}