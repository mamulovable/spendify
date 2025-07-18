import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Loader2 } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase';
import { AdminUser } from '@/types/auth';

interface TicketAssignmentDialogProps {
  ticketId: string;
  currentAssignee?: string;
  onAssign: (params: { ticketId: string; adminId: string }) => void;
  isAssigning: boolean;
}

export function TicketAssignmentDialog({
  ticketId,
  currentAssignee,
  onAssign,
  isAssigning
}: TicketAssignmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch admin users
  useEffect(() => {
    const fetchAdmins = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('is_active', true)
          .order('full_name');

        if (error) {
          throw error;
        }

        setAdmins(data as AdminUser[]);
        setFilteredAdmins(data as AdminUser[]);
      } catch (error) {
        console.error('Error fetching admin users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchAdmins();
    }
  }, [open]);

  // Filter admins based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAdmins(admins);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = admins.filter(
      admin => 
        admin.full_name.toLowerCase().includes(query) || 
        admin.email.toLowerCase().includes(query)
    );
    
    setFilteredAdmins(filtered);
  }, [searchQuery, admins]);

  // Handle admin selection
  const handleSelectAdmin = (adminId: string) => {
    onAssign({ ticketId, adminId });
    setOpen(false);
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <UserPlus className="h-4 w-4 mr-2" />
          {currentAssignee ? 'Reassign Ticket' : 'Assign Ticket'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Ticket</DialogTitle>
          <DialogDescription>
            Select a team member to assign this support ticket to.
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative my-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search team members..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <ScrollArea className="h-72 rounded-md border p-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No team members found
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAdmins.map((admin) => (
                <div
                  key={admin.id}
                  className={`flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer ${
                    admin.id === currentAssignee ? 'bg-accent/50' : ''
                  }`}
                  onClick={() => handleSelectAdmin(admin.id)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(admin.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{admin.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
                  </div>
                  {admin.id === currentAssignee && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      Current
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          {isAssigning && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Assigning...
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}