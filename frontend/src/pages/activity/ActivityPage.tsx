import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Topbar } from '@/components/navigation/Topbar';
import { EmptyState } from '@/components/common/EmptyState';
import { Activity } from 'lucide-react';

export function ActivityPage() {
  return (
    <DashboardLayout>
      <Topbar
        title="Activity"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Activity' },
        ]}
      />
      <div className="p-6">
        <EmptyState
          title="Activity Feed"
          description="View and track all activities across your workspace."
          icon={<Activity />}
        />
      </div>
    </DashboardLayout>
  );
}
