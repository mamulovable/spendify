import React, { useState } from 'react';
import { Bell, BellOff, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

interface TicketNotificationSettingsProps {
  ticketId: string;
}

export function TicketNotificationSettings({ ticketId }: TicketNotificationSettingsProps) {
  const [open, setOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [notifyOnReply, setNotifyOnReply] = useState(true);
  const [notifyOnStatusChange, setNotifyOnStatusChange] = useState(true);
  const [notifyOnAssignment, setNotifyOnAssignment] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleToggleSubscription = () => {
    setIsSubscribed(!isSubscribed);
  };

  const handleSaveSettings = async () => {
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would save the notification preferences to the database
      // For now, we'll just simulate a successful save
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: isSubscribed ? "Notifications enabled" : "Notifications disabled",
        description: isSubscribed 
          ? "You will now receive notifications for this ticket." 
          : "You will no longer receive notifications for this ticket.",
        variant: "default",
      });
      
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error saving notification settings",
        description: "There was a problem saving your notification settings.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          {isSubscribed ? (
            <>
              <Bell className="h-4 w-4 mr-2" />
              Notification Settings
            </>
          ) : (
            <>
              <BellOff className="h-4 w-4 mr-2" />
              Enable Notifications
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
          <DialogDescription>
            Configure when you want to receive notifications for this ticket.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="subscribe">Receive notifications</Label>
              <p className="text-sm text-muted-foreground">
                Toggle all notifications for this ticket
              </p>
            </div>
            <Switch
              id="subscribe"
              checked={isSubscribed}
              onCheckedChange={handleToggleSubscription}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <Label className="text-sm font-medium">Notify me when:</Label>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="notify-reply" className="flex-1 text-sm">
                Someone replies to this ticket
              </Label>
              <Switch
                id="notify-reply"
                checked={isSubscribed && notifyOnReply}
                onCheckedChange={setNotifyOnReply}
                disabled={!isSubscribed}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="notify-status" className="flex-1 text-sm">
                The ticket status changes
              </Label>
              <Switch
                id="notify-status"
                checked={isSubscribed && notifyOnStatusChange}
                onCheckedChange={setNotifyOnStatusChange}
                disabled={!isSubscribed}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="notify-assignment" className="flex-1 text-sm">
                The ticket is assigned or reassigned
              </Label>
              <Switch
                id="notify-assignment"
                checked={isSubscribed && notifyOnAssignment}
                onCheckedChange={setNotifyOnAssignment}
                disabled={!isSubscribed}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveSettings} disabled={isSubmitting}>
            {isSubmitting ? (
              <>Saving...</>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}