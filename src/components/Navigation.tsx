// This component has been integrated into the Navbar component
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/contexts/AdminContext';

export function Navigation() {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  return null;
}