import { supabase } from '@/lib/supabase';
import { Announcement, AnnouncementFormData } from '@/types/announcement';

export const announcementService = {
  // Get all announcements
  async getAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabase
      .from('app_announcements')
      .select('*, admin_users!created_by(full_name)')
      .order('start_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching announcements:', error);
      throw new Error(`Failed to fetch announcements: ${error.message}`);
    }
    
    return data.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      type: item.type,
      startDate: item.start_date,
      endDate: item.end_date,
      targetPlans: item.target_plans,
      isActive: item.is_active,
      createdBy: item.admin_users?.full_name || null,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    })) || [];
  },
  
  // Get active announcements
  async getActiveAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabase
      .from('admin_active_announcements')
      .select('*')
      .order('start_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching active announcements:', error);
      throw new Error(`Failed to fetch active announcements: ${error.message}`);
    }
    
    return data.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      type: item.type,
      startDate: item.start_date,
      endDate: item.end_date,
      targetPlans: item.target_plans,
      isActive: item.is_active,
      createdBy: item.created_by_name,
      createdAt: item.created_at,
      updatedAt: item.created_at // View doesn't include updated_at
    })) || [];
  },
  
  // Get a specific announcement
  async getAnnouncement(id: string): Promise<Announcement | null> {
    const { data, error } = await supabase
      .from('app_announcements')
      .select('*, admin_users!created_by(full_name)')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error(`Error fetching announcement ${id}:`, error);
      throw new Error(`Failed to fetch announcement: ${error.message}`);
    }
    
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      type: data.type,
      startDate: data.start_date,
      endDate: data.end_date,
      targetPlans: data.target_plans,
      isActive: data.is_active,
      createdBy: data.admin_users?.full_name || null,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },
  
  // Create a new announcement
  async createAnnouncement(announcementData: AnnouncementFormData): Promise<string> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    const { data, error } = await supabase.rpc('create_announcement', {
      title: announcementData.title,
      content: announcementData.content,
      type: announcementData.type,
      start_date: announcementData.startDate.toISOString(),
      end_date: announcementData.endDate.toISOString(),
      target_plans: announcementData.targetPlans,
      is_active: announcementData.isActive,
      admin_id: userId
    });
    
    if (error) {
      console.error('Error creating announcement:', error);
      throw new Error(`Failed to create announcement: ${error.message}`);
    }
    
    return data;
  },
  
  // Update an existing announcement
  async updateAnnouncement(id: string, announcementData: AnnouncementFormData): Promise<boolean> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    const { data, error } = await supabase.rpc('update_announcement', {
      announcement_id: id,
      title: announcementData.title,
      content: announcementData.content,
      type: announcementData.type,
      start_date: announcementData.startDate.toISOString(),
      end_date: announcementData.endDate.toISOString(),
      target_plans: announcementData.targetPlans,
      is_active: announcementData.isActive,
      admin_id: userId
    });
    
    if (error) {
      console.error(`Error updating announcement ${id}:`, error);
      throw new Error(`Failed to update announcement: ${error.message}`);
    }
    
    return data;
  },
  
  // Delete an announcement
  async deleteAnnouncement(id: string): Promise<void> {
    const { error } = await supabase
      .from('app_announcements')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting announcement ${id}:`, error);
      throw new Error(`Failed to delete announcement: ${error.message}`);
    }
  },
  
  // Toggle announcement active status
  async toggleAnnouncementActive(id: string, isActive: boolean): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    const { error } = await supabase
      .from('app_announcements')
      .update({
        is_active: isActive,
        last_updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error(`Error toggling announcement ${id}:`, error);
      throw new Error(`Failed to toggle announcement: ${error.message}`);
    }
  }
};