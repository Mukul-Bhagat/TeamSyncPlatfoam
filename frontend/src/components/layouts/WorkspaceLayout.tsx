import type { ReactNode } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { usePanelStore } from '@/store/usePanelStore';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/navigation/Sidebar';
import { RightPanel } from '@/components/panels/RightPanel';
import { ConnectionStatusIndicator } from '@/components/realtime';

interface WorkspaceLayoutProps {
  children?: ReactNode;
  rightPanelContent?: ReactNode;
  rightPanelTitle?: string;
  className?: string;
  currentOrganizationId?: string;
  currentWorkspaceId?: string;
  currentChannelId?: string;
  onOrganizationChange?: (id: string) => void;
  onWorkspaceChange?: (id: string) => void;
  onChannelSelect?: (channelId: string) => void;
  onCreateOrganization?: () => void;
  onCreateWorkspace?: () => void;
}

export function WorkspaceLayout({
  children,
  rightPanelContent,
  rightPanelTitle = 'Context',
  className,
  currentOrganizationId,
  currentWorkspaceId,
  currentChannelId,
  onOrganizationChange,
  onWorkspaceChange,
  onChannelSelect,
  onCreateOrganization,
  onCreateWorkspace,
}: WorkspaceLayoutProps) {
  const { leftSidebarCollapsed, rightPanelCollapsed } = usePanelStore();
  const navigate = useNavigate();
  const { workspaceId, channelId } = useParams();

  const handleChannelSelect = (selectedChannelId: string) => {
    const wsId = workspaceId || currentWorkspaceId;
    if (wsId) {
      navigate(`/workspace/${wsId}/channel/${selectedChannelId}`);
    }
    onChannelSelect?.(selectedChannelId);
  };

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Left Sidebar - 20% */}
      <Sidebar
        currentOrganizationId={currentOrganizationId}
        currentWorkspaceId={currentWorkspaceId}
        currentChannelId={channelId || currentChannelId}
        onOrganizationChange={onOrganizationChange}
        onWorkspaceChange={onWorkspaceChange}
        onChannelSelect={handleChannelSelect}
        onCreateOrganization={onCreateOrganization}
        onCreateWorkspace={onCreateWorkspace}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          'transition-all duration-normal ease-out-cubic',
          // Desktop: Account for sidebar
          'lg:ml-0',
          leftSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-[280px]',
          // Desktop: Account for right panel
          rightPanelCollapsed ? 'lg:mr-0' : 'lg:mr-[350px]',
          // Mobile: Full width
          'ml-0 mr-0'
        )}
      >
        {/* Connection Status Indicator */}
        <div className="fixed top-4 right-4 z-50">
          <ConnectionStatusIndicator />
        </div>

        {/* Center Content - 55% */}
        <main className={cn('min-h-screen', className)}>
          {children || <Outlet />}
        </main>
      </div>

      {/* Right Context Panel - 25% */}
      {rightPanelContent && (
        <RightPanel title={rightPanelTitle}>{rightPanelContent}</RightPanel>
      )}
    </div>
  );
}
