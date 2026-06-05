import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Topbar } from '@/components/navigation/Topbar';
import { EmptyState } from '@/components/common/EmptyState';
import { Cpu } from 'lucide-react';

export function OperationsPage() {
  return (
    <DashboardLayout>
      <Topbar
        title="Operations"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Operations' },
        ]}
      />
      <div className="p-6">
        <EmptyState
          title="Operations Center"
          description="Monitor and manage your operations, deployments, and incidents."
          icon={<Cpu />}
        />
      </div>
    </DashboardLayout>
  );
}
