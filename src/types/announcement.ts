export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  startDate: string;
  endDate: string;
  targetPlans: string[] | null;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementFormData {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  startDate: Date;
  endDate: Date;
  targetPlans: string[] | null;
  isActive: boolean;
}