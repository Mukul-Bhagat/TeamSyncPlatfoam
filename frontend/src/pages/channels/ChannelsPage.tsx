import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Topbar } from '@/components/navigation/Topbar';
import { EmptyState } from '@/components/common/EmptyState';
import { MessageSquare } from 'lucide-react';

export function ChannelsPage() {
  return (
    <DashboardLayout>
      <Topbar
        title="Channels"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Channels' },
        ]}
      />
      <div className="p-6">
        <EmptyState
          title="Channels"
          description="View and manage all channels in your workspace."
          icon={<MessageSquare />}
        />
      </div>
    </DashboardLayout>
  );
}
