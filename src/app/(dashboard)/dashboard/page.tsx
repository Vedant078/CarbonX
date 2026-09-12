'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getDashboardRouteForRole } from '@/lib/rbac';

export default function DashboardRootPage() {
  const router = useRouter();
  const { role } = useAuth();

  useEffect(() => {
    const target = getDashboardRouteForRole(role || 'BUYER');
    router.replace(target);
  }, [role, router]);

  return (
    <div className="p-12 text-center text-slate-500 font-semibold">
      Redirecting to {role ? role.replace('_', ' ') : 'BUYER'} Workspace...
    </div>
  );
}
