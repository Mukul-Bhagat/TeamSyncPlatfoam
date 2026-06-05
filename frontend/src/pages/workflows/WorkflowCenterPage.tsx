import { useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Topbar } from '@/components/navigation/Topbar';
import { WorkflowList } from '@/features/workflows/components/WorkflowList';
import { WorkflowEditor } from '@/features/workflows/components/WorkflowEditor';
import { useOrganizations } from '@/features/organization/hooks/useOrganizations';
import type { Workflow } from '@/types/workflows';
import { ArrowLeft } from 'lucide-react';

export function WorkflowCenterPage() {
  const { data: organizations } = useOrganizations();
  const organizationId = organizations?.[0]?.organization_id || '';
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectWorkflow = (workflow: Workflow) => {
    setSelectedWorkflowId(workflow.id);
    setIsCreating(false);
  };

  const handleCreateWorkflow = () => {
    setSelectedWorkflowId(null);
    setIsCreating(true);
  };

  const handleBack = () => {
    setSelectedWorkflowId(null);
    setIsCreating(false);
  };

  return (
    <DashboardLayout>
      {selectedWorkflowId || isCreating ? (
        <>
          <Topbar
            title={isCreating ? 'Create Workflow' : 'Edit Workflow'}
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Workflows', href: '/workflows' },
              { label: isCreating ? 'Create' : 'Edit' },
            ]}
            actions={
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-glass border border-glass-border rounded-lg hover:bg-primary/10 transition-all duration-fast"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            }
          />
          <div className="p-6">
            {selectedWorkflowId && !isCreating ? (
              <WorkflowEditor
                workflowId={selectedWorkflowId}
                onSave={handleBack}
                onCancel={handleBack}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Workflow creation coming soon</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <Topbar
            title="Workflow Center"
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Workflows' },
            ]}
          />
          <div className="p-6">
            <WorkflowList
              organizationId={organizationId}
              onSelectWorkflow={handleSelectWorkflow}
              onCreateWorkflow={handleCreateWorkflow}
            />
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
