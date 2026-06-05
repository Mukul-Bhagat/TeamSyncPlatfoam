import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Topbar } from '@/components/navigation/Topbar';
import { EmptyState } from '@/components/common/EmptyState';
import { Users } from 'lucide-react';

export function TeamPage() {
  return (
    <DashboardLayout>
      <Topbar
        title="Team"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Team' },
        ]}
      />
      <div className="p-6">
        <EmptyState
          title="Team Management"
          description="Manage your team members, roles, and permissions."
          icon={<Users />}
        />
      </div>
    </DashboardLayout>
  );
}
