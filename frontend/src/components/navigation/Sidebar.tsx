import type { ReactNode } from 'react';
import { useState } from 'react';
import { usePanelStore } from '@/store/usePanelStore';
import { X, ChevronLeft, ChevronRight, Layers, Users, MessageSquare, Calendar, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarItem } from './SidebarItem';
import { OrganizationSwitcher } from '@/components/organization/OrganizationSwitcher';
import { WorkspaceSwitcher } from '@/components/workspace/WorkspaceSwitcher';
import { ChannelSidebar } from '@/components/channels/ChannelSidebar';
import { CreateChannelModal } from '@/components/channels/CreateChannelModal';

interface SidebarProps {
  children?: ReactNode;
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

export function Sidebar({
  children,
  className,
  currentOrganizationId,
  currentWorkspaceId,
  currentChannelId,
  onOrganizationChange,
  onWorkspaceChange,
  onChannelSelect,
  onCreateOrganization,
  onCreateWorkspace,
}: SidebarProps) {
  const {
    leftSidebarCollapsed,
    leftSidebarMobileOpen,
    toggleLeftSidebar,
    setLeftSidebarMobileOpen,
  } = usePanelStore();
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);

  const navigation = [
    { icon: Layers, label: 'Workspace', href: '/workspace', badge: 3 },
    { icon: MessageSquare, label: 'Channels', href: '/channels' },
    { icon: Users, label: 'Team', href: '/team' },
    { icon: Calendar, label: 'Activity', href: '/activity' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {leftSidebarMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={() => setLeftSidebarMobileOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full bg-card/95 backdrop-blur-glass-md border-r',
          'transition-all duration-normal ease-out-cubic',
          'shadow-elevation-lg',
          // Desktop behavior
          'hidden lg:flex flex-col',
          leftSidebarCollapsed ? 'w-16' : 'w-[280px]',
          // Mobile behavior
          'lg:hidden',
          leftSidebarMobileOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {!leftSidebarCollapsed && (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Layers className="h-5 w-5 text-white" />
                </div>
                <span className="font-heading font-bold text-lg text-foreground">
                  TeamSync
                </span>
              </div>
              <button
                onClick={toggleLeftSidebar}
                className="p-2 rounded-lg hover:bg-muted transition-colors duration-fast"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </button>
            </>
          )}

          {leftSidebarCollapsed && (
            <button
              onClick={toggleLeftSidebar}
              className="p-2 rounded-lg hover:bg-muted transition-colors duration-fast"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          )}

          {/* Mobile close button */}
          <button
            onClick={() => setLeftSidebarMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors duration-fast"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {!leftSidebarCollapsed ? (
            <>
              {/* Organization & Workspace Switchers */}
              <div className="mb-4 space-y-2">
                <OrganizationSwitcher
                  currentOrganizationId={currentOrganizationId}
                  onOrganizationChange={onOrganizationChange}
                  onCreateOrganization={onCreateOrganization}
                />
                {currentOrganizationId && (
                  <WorkspaceSwitcher
                    organizationId={currentOrganizationId}
                    currentWorkspaceId={currentWorkspaceId}
                    onWorkspaceChange={onWorkspaceChange}
                    onCreateWorkspace={onCreateWorkspace}
                  />
                )}
              </div>

              {/* Channel Sidebar */}
              {currentWorkspaceId && (
                <div className="mb-4">
                  <ChannelSidebar
                    workspaceId={currentWorkspaceId}
                    currentChannelId={currentChannelId}
                    onChannelSelect={onChannelSelect}
                    onCreateChannel={() => setIsCreateChannelModalOpen(true)}
                  />
                </div>
              )}

              <div className="mb-4">
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Main
                </p>
                {navigation.slice(0, 3).map((item) => (
                  <SidebarItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    badge={item.badge}
                  />
                ))}
              </div>

              <div className="mb-4">
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Workspace
                </p>
                {navigation.slice(3).map((item) => (
                  <SidebarItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                  />
                ))}
              </div>

              {children}
            </>
          ) : (
            <div className="flex flex-col items-center py-4 space-y-4">
              {navigation.map((item) => (
                <button
                  key={item.label}
                  className="p-2 rounded-lg hover:bg-muted transition-colors duration-fast"
                  title={item.label}
                >
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* Footer */}
        {!leftSidebarCollapsed && (
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors duration-fast cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-subtle flex items-center justify-center">
                <span className="font-heading font-semibold text-sm text-primary">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">User</p>
                <p className="text-xs text-muted-foreground truncate">Online</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setLeftSidebarMobileOpen(true)}
        className={cn(
          'lg:hidden fixed top-4 left-4 z-30',
          'p-2 rounded-lg bg-card/80 backdrop-blur-glass-md border',
          'shadow-elevation-md',
          'transition-all duration-normal ease-out-cubic',
          leftSidebarMobileOpen && 'hidden'
        )}
        aria-label="Open sidebar"
      >
        <Layers className="h-5 w-5 text-foreground" />
      </button>

      {/* Create Channel Modal */}
      {currentWorkspaceId && (
        <CreateChannelModal
          workspaceId={currentWorkspaceId}
          isOpen={isCreateChannelModalOpen}
          onClose={() => setIsCreateChannelModalOpen(false)}
        />
      )}
    </>
  );
}
