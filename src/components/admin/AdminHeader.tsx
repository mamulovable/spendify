import React, { useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Bell, 
  Search, 
  Settings, 
  LogOut, 
  User, 
  Moon, 
  Sun, 
  HelpCircle, 
  AlertTriangle,
  Shield
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function AdminHeader() {
  const { adminUser } = useAdmin();
  const { signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleTheme = () => {
    // In a real implementation, this would toggle the theme in the app
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Mock notification counts - in a real app these would come from a context or API
  const notificationCount = 3;
  const alertCount = 2;

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 gap-4">
        <div className="flex-1">
          <div className="relative max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search users, documents, tickets..."
              className="pl-8 h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/admin/security/alerts">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  {alertCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {alertCount}
                    </Badge>
                  )}
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Security Alerts</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/admin/notifications">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge variant="secondary" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {notificationCount}
                    </Badge>
                  )}
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle theme</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Help & Resources</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Help & Resources</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Documentation
            </DropdownMenuItem>
            <DropdownMenuItem>
              Admin Guide
            </DropdownMenuItem>
            <DropdownMenuItem>
              Report an Issue
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {adminUser?.role?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{adminUser?.email}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {adminUser?.role?.name || 'Admin'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin/security/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/security/admins">
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin Users</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
