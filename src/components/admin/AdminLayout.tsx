import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { Loader2 } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

export function AdminLayout() {
  const { isAdmin, isLoading } = useAdmin();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminHeader />
      <div className="flex flex-1 h-[calc(100vh-4rem)]">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
