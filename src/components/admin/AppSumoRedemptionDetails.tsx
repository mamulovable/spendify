import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Copy, ExternalLink, Mail, User, Calendar, Tag, CheckCircle, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export interface AppSumoRedemption {
  id: string;
  code: string;
  user_id: string;
  user_email?: string;
  plan_type: string;
  redeemed_at: string;
  ip_address?: string;
  user_agent?: string;
  is_upgrade: boolean;
  previous_plan?: string;
  status: string;
}

interface AppSumoRedemptionDetailsProps {
  redemption: AppSumoRedemption | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewUser?: (userId: string) => void;
}

export function AppSumoRedemptionDetails({
  redemption,
  open,
  onOpenChange,
  onViewUser
}: AppSumoRedemptionDetailsProps) {
  if (!redemption) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  // Format date with time
  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP p');
    } catch (e) {
      return dateString;
    }
  };

  // Get plan type display name
  const getPlanTypeDisplay = (planType: string) => {
    switch (planType) {
      case 'ltd_solo':
        return 'LTD Solo';
      case 'ltd_pro':
        return 'LTD Pro';
      default:
        return planType;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>AppSumo Redemption Details</span>
            <Badge variant="outline" className="border-blue-500 text-blue-700">
              {getPlanTypeDisplay(redemption.plan_type)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Code: {redemption.code}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* User Information */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center">
              <User className="h-4 w-4 mr-2" />
              User Information
            </h3>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <div className="flex items-center gap-1">
                  <p className="text-sm">{redemption.user_email || 'N/A'}</p>
                  {redemption.user_email && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5" 
                      onClick={() => copyToClipboard(redemption.user_email || '')}
                    >
                      <Copy className="h-3 w-3" />
                      <span className="sr-only">Copy email</span>
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                <div className="flex items-center gap-1">
                  <p className="text-sm font-mono text-xs">{redemption.user_id}</p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5" 
                    onClick={() => copyToClipboard(redemption.user_id)}
                  >
                    <Copy className="h-3 w-3" />
                    <span className="sr-only">Copy user ID</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Redemption Details */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Redemption Details
            </h3>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Redemption Date</p>
                <p className="text-sm">{formatDateTime(redemption.redeemed_at)}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-sm capitalize">{redemption.status}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Plan Type</p>
                <p className="text-sm">{getPlanTypeDisplay(redemption.plan_type)}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Upgrade</p>
                <p className="text-sm">{redemption.is_upgrade ? 'Yes' : 'No'}</p>
              </div>
              
              {redemption.is_upgrade && redemption.previous_plan && (
                <div className="space-y-1 col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Previous Plan</p>
                  <p className="text-sm">{redemption.previous_plan}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Technical Details */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Technical Details
            </h3>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                <p className="text-sm font-mono text-xs">{redemption.ip_address || 'N/A'}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Redemption ID</p>
                <div className="flex items-center gap-1">
                  <p className="text-sm font-mono text-xs">{redemption.id}</p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5" 
                    onClick={() => copyToClipboard(redemption.id)}
                  >
                    <Copy className="h-3 w-3" />
                    <span className="sr-only">Copy redemption ID</span>
                  </Button>
                </div>
              </div>
            </div>
            
            {redemption.user_agent && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">User Agent</p>
                <p className="text-sm text-xs break-all">{redemption.user_agent}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="border-t pt-4 flex justify-between">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          
          <div className="flex gap-2">
            {redemption.user_email && (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${redemption.user_email}`} target="_blank" rel="noopener noreferrer">
                  <Mail className="mr-2 h-4 w-4" />
                  Email User
                </a>
              </Button>
            )}
            
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => onViewUser && onViewUser(redemption.user_id)}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View User Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}