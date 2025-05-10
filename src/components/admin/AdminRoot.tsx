import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

export function AdminRoot() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <Outlet />
      </Suspense>
    </div>
  );
}
