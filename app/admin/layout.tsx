import type { Metadata } from 'next';
import './admin.css';
import { IdleLogout } from '@/components/admin/IdleLogout';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-root">
      <IdleLogout />
      {children}
    </div>
  );
}
