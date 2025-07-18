import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementService } from '@/services/announcementService';
import { Announcement, AnnouncementFormData } from '@/types/announcement';
import { toast } from '@/components/ui/use-toast';

export const useAnnouncements = () => {
  const queryClient = useQueryClient();
  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  
  // Get all announcements
  const {
    data: announcements,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => announcementService.getAnnouncements(),
  });
  
  // Get active announcements
  const {
    data: activeAnnouncements,
    isLoading: isLoadingActive,
    refetch: refetchActive
  } = useQuery({
    queryKey: ['activeAnnouncements'],
    queryFn: () => announcementService.getActiveAnnouncements(),
  });
  
  // Create announcement
  const createAnnouncementMutation = useMutation({
    mutationFn: (announcementData: AnnouncementFormData) => 
      announcementService.createAnnouncement(announcementData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['activeAnnouncements'] });
      toast({
        title: 'Announcement created',
        description: 'The announcement has been created successfully.',
      });
      setIsCreatingAnnouncement(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating announcement',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Update announcement
  const updateAnnouncementMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AnnouncementFormData }) => 
      announcementService.updateAnnouncement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['activeAnnouncements'] });
      toast({
        title: 'Announcement updated',
        description: 'The announcement has been updated successfully.',
      });
      setEditingAnnouncement(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating announcement',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Delete announcement
  const deleteAnnouncementMutation = useMutation({
    mutationFn: (id: string) => announcementService.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['activeAnnouncements'] });
      toast({
        title: 'Announcement deleted',
        description: 'The announcement has been deleted successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting announcement',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Toggle announcement active status
  const toggleAnnouncementActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      announcementService.toggleAnnouncementActive(id, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['activeAnnouncements'] });
      toast({
        title: `Announcement ${variables.isActive ? 'activated' : 'deactivated'}`,
        description: `The announcement has been ${variables.isActive ? 'activated' : 'deactivated'} successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error toggling announcement',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  return {
    announcements,
    activeAnnouncements,
    isLoading,
    isLoadingActive,
    error,
    refetch,
    refetchActive,
    isCreatingAnnouncement,
    setIsCreatingAnnouncement,
    editingAnnouncement,
    setEditingAnnouncement,
    createAnnouncement: createAnnouncementMutation.mutate,
    updateAnnouncement: updateAnnouncementMutation.mutate,
    deleteAnnouncement: deleteAnnouncementMutation.mutate,
    toggleAnnouncementActive: toggleAnnouncementActiveMutation.mutate,
    isCreating: createAnnouncementMutation.isPending,
    isUpdating: updateAnnouncementMutation.isPending,
    isDeleting: deleteAnnouncementMutation.isPending,
    isToggling: toggleAnnouncementActiveMutation.isPending,
  };
};