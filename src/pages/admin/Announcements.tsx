import { useState } from 'react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { AnnouncementDialog } from '@/components/admin/AnnouncementDialog';
import { Announcement, AnnouncementFormData } from '@/types/announcement';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { format, isAfter, isBefore, parseISO } from 'date-fns';

export default function Announcements() {
  const {
    announcements,
    activeAnnouncements,
    isLoading,
    isCreatingAnnouncement,
    setIsCreatingAnnouncement,
    editingAnnouncement,
    setEditingAnnouncement,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    toggleAnnouncementActive,
    isCreating,
    isUpdating,
    isDeleting,
    isToggling,
  } = useAnnouncements();
  
  const [activeTab, setActiveTab] = useState('all');
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null);
  const [previewAnnouncement, setPreviewAnnouncement] = useState<Announcement | null>(null);
  
  const handleCreateAnnouncement = (data: AnnouncementFormData) => {
    createAnnouncement(data);
  };
  
  const handleUpdateAnnouncement = (data: AnnouncementFormData) => {
    if (editingAnnouncement) {
      updateAnnouncement({ id: editingAnnouncement.id, data });
    }
  };
  
  const handleDeleteAnnouncement = () => {
    if (announcementToDelete) {
      deleteAnnouncement(announcementToDelete);
      setAnnouncementToDelete(null);
    }
  };
  
  const handleToggleActive = (announcement: Announcement) => {
    toggleAnnouncementActive({
      id: announcement.id,
      isActive: !announcement.isActive,
    });
  };
  
  const getAnnouncementStatus = (announcement: Announcement) => {
    const now = new Date();
    const startDate = parseISO(announcement.startDate);
    const endDate = parseISO(announcement.endDate);
    
    if (!announcement.isActive) {
      return { label: 'Inactive', color: 'gray' };
    }
    
    if (isBefore(now, startDate)) {
      return { label: 'Scheduled', color: 'blue' };
    }
    
    if (isAfter(now, endDate)) {
      return { label: 'Expired', color: 'gray' };
    }
    
    return { label: 'Active', color: 'green' };
  };
  
  const filteredAnnouncements = activeTab === 'active'
    ? activeAnnouncements
    : announcements;
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">
            Manage system announcements and notifications
          </p>
        </div>
        <Button onClick={() => setIsCreatingAnnouncement(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Announcement
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Announcements</TabsTrigger>
          <TabsTrigger value="active">Active Announcements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Announcements</CardTitle>
              <CardDescription>
                Manage all system announcements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading announcements...</div>
              ) : announcements?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No announcements found. Create your first announcement to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Range</TableHead>
                      <TableHead>Target Plans</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements?.map((announcement) => {
                      const status = getAnnouncementStatus(announcement);
                      
                      return (
                        <TableRow key={announcement.id}>
                          <TableCell className="font-medium">{announcement.title}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                announcement.type === 'info' ? 'default' :
                                announcement.type === 'warning' ? 'warning' :
                                announcement.type === 'success' ? 'success' :
                                'destructive'
                              }
                            >
                              {announcement.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`bg-${status.color}-50 text-${status.color}-700 border-${status.color}-200`}
                            >
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-xs">
                                {format(parseISO(announcement.startDate), 'MMM d, yyyy')} - 
                                {format(parseISO(announcement.endDate), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {announcement.targetPlans?.map((plan) => (
                                <Badge key={plan} variant="outline" className="text-xs">
                                  {plan}
                                </Badge>
                              )) || <span className="text-xs text-gray-500">All plans</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={announcement.isActive}
                              onCheckedChange={() => handleToggleActive(announcement)}
                              disabled={isToggling}
                            />
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setPreviewAnnouncement(announcement)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Preview
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setEditingAnnouncement(announcement)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setAnnouncementToDelete(announcement.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Announcements</CardTitle>
              <CardDescription>
                Currently active announcements visible to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading active announcements...</div>
              ) : activeAnnouncements?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No active announcements found.
                </div>
              ) : (
                <div className="space-y-4">
                  {activeAnnouncements?.map((announcement) => (
                    <Card key={announcement.id} className={`border-l-4 border-l-${announcement.type === 'info' ? 'blue' : announcement.type === 'warning' ? 'yellow' : announcement.type === 'success' ? 'green' : 'red'}-500`}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle>{announcement.title}</CardTitle>
                          <Badge variant={
                            announcement.type === 'info' ? 'default' :
                            announcement.type === 'warning' ? 'warning' :
                            announcement.type === 'success' ? 'success' :
                            'destructive'
                          }>
                            {announcement.type}
                          </Badge>
                        </div>
                        <CardDescription>
                          {format(parseISO(announcement.startDate), 'MMM d, yyyy')} - 
                          {format(parseISO(announcement.endDate), 'MMM d, yyyy')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-line">{announcement.content}</p>
                        {announcement.targetPlans && announcement.targetPlans.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">Visible to plans:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {announcement.targetPlans.map((plan) => (
                                <Badge key={plan} variant="outline">
                                  {plan}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Create/Edit Announcement Dialog */}
      {isCreatingAnnouncement && (
        <AnnouncementDialog
          open={isCreatingAnnouncement}
          onOpenChange={setIsCreatingAnnouncement}
          onSave={handleCreateAnnouncement}
          isSubmitting={isCreating}
        />
      )}
      
      {editingAnnouncement && (
        <AnnouncementDialog
          open={!!editingAnnouncement}
          onOpenChange={() => setEditingAnnouncement(null)}
          announcement={editingAnnouncement}
          onSave={handleUpdateAnnouncement}
          isSubmitting={isUpdating}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!announcementToDelete} onOpenChange={() => setAnnouncementToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this announcement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAnnouncement}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Preview Announcement Dialog */}
      {previewAnnouncement && (
        <AlertDialog open={!!previewAnnouncement} onOpenChange={() => setPreviewAnnouncement(null)}>
          <AlertDialogContent className="max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>{previewAnnouncement.title}</AlertDialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant={
                  previewAnnouncement.type === 'info' ? 'default' :
                  previewAnnouncement.type === 'warning' ? 'warning' :
                  previewAnnouncement.type === 'success' ? 'success' :
                  'destructive'
                }>
                  {previewAnnouncement.type}
                </Badge>
                <span className="text-sm text-gray-500">
                  {format(parseISO(previewAnnouncement.startDate), 'MMM d, yyyy')} - 
                  {format(parseISO(previewAnnouncement.endDate), 'MMM d, yyyy')}
                </span>
              </div>
            </AlertDialogHeader>
            <div className="py-4">
              <p className="whitespace-pre-line">{previewAnnouncement.content}</p>
              
              {previewAnnouncement.targetPlans && previewAnnouncement.targetPlans.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Visible to plans:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {previewAnnouncement.targetPlans.map((plan) => (
                      <Badge key={plan} variant="outline">
                        {plan}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-4 text-sm text-gray-500">
                <p>Created by: {previewAnnouncement.createdBy || 'System'}</p>
                <p>Created: {format(parseISO(previewAnnouncement.createdAt), 'MMM d, yyyy h:mm a')}</p>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogAction>Close</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}