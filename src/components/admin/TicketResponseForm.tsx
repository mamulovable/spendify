import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { TicketResponseParams } from '@/types/supportTicket';

interface TicketResponseFormProps {
  ticketId: string;
  onSubmit: (params: TicketResponseParams) => void;
  isSubmitting: boolean;
}

export function TicketResponseForm({ ticketId, onSubmit, isSubmitting }: TicketResponseFormProps) {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    onSubmit({
      ticketId,
      content: content.trim(),
    });
    
    setContent('');
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="p-4">
          <Textarea
            placeholder="Type your response here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="resize-none"
            disabled={isSubmitting}
          />
        </CardContent>
        <CardFooter className="flex justify-between px-4 pb-4 pt-0">
          <div className="text-xs text-muted-foreground">
            Press Enter to submit, Shift+Enter for new line
          </div>
          <Button 
            type="submit" 
            disabled={!content.trim() || isSubmitting}
            size="sm"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Sending...' : 'Send Response'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}