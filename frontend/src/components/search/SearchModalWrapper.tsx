import { useEffect } from 'react';
import { SearchCommand } from './SearchCommand';
import { useOrganizations } from '@/features/organization/hooks/useOrganizations';
import { useWorkspaces } from '@/features/workspace/hooks/useWorkspaces';
import { useWorkspaceContextStore } from '@/store/workspace-context.store';

interface SearchModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModalWrapper({ isOpen, onClose }: SearchModalWrapperProps) {
  const {
    organizationId,
    workspaceId,
    setOrganizationId,
    setWorkspaceId,
  } = useWorkspaceContextStore();
  const { data: organizations } = useOrganizations();
  const resolvedOrganizationId = organizationId || organizations?.[0]?.organization_id || '';
  const { data: workspaces } = useWorkspaces(resolvedOrganizationId);
  const resolvedWorkspaceId = workspaceId || workspaces?.[0]?.id;

  useEffect(() => {
    if (!organizationId && organizations?.[0]?.organization_id) {
      setOrganizationId(organizations[0].organization_id);
    }
  }, [organizationId, organizations, setOrganizationId]);

  useEffect(() => {
    if (!workspaceId && workspaces?.[0]?.id) {
      setWorkspaceId(workspaces[0].id);
    }
  }, [setWorkspaceId, workspaces, workspaceId]);

  return (
    <SearchCommand
      organizationId={resolvedOrganizationId}
      workspaceId={resolvedWorkspaceId}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}
