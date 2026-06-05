import { useState } from 'react';
import { useOrganizations } from '@/features/organization/hooks/useOrganizations';
import { Building2, ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrganizationSwitcherProps {
  currentOrganizationId?: string;
  onOrganizationChange?: (organizationId: string) => void;
  onCreateOrganization?: () => void;
}

export function OrganizationSwitcher({
  currentOrganizationId,
  onOrganizationChange,
  onCreateOrganization,
}: OrganizationSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: organizations, isLoading } = useOrganizations();

  const currentOrg = organizations?.find(
    (org) => org.organization_id === currentOrganizationId
  ) || organizations?.[0];

  const currentOrganizationLabel =
    currentOrg?.organizations?.name || 'Select Organization';

  const currentOrganizationValue =
    currentOrg?.organization_id || currentOrganizationId || undefined;

  if (isLoading) {
    return (
      <div className="w-full h-10 bg-glass border border-glass-border rounded-lg animate-pulse" />
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2',
          'bg-glass border border-glass-border rounded-lg',
          'hover:border-primary/50 transition-all duration-fast',
          'focus:outline-none focus:ring-2 focus:ring-ring'
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground truncate">
            {currentOrganizationLabel}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-muted-foreground transition-transform duration-fast',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={cn(
              'absolute top-full left-0 right-0 mt-2',
              'bg-glass border border-glass-border rounded-lg',
              'shadow-elevation-lg backdrop-blur-xl',
              'overflow-hidden z-20 animate-in fade-in slide-in-from-top-2'
            )}
          >
            <div className="p-2 space-y-1">
              {organizations?.map((org) => (
                <button
                  key={org.organization_id}
                  onClick={() => {
                    onOrganizationChange?.(org.organization_id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg',
                    'text-left transition-all duration-fast',
                    'hover:bg-primary/10',
                    currentOrganizationValue === org.organization_id
                      ? 'bg-primary/20 text-primary'
                      : 'text-foreground'
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium truncate">
                    {org.organizations?.name}
                  </span>
                </button>
              ))}
            </div>

            {onCreateOrganization && (
              <div className="border-t border-glass-border p-2">
                <button
                  onClick={() => {
                    onCreateOrganization();
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg',
                    'text-sm font-medium text-muted-foreground',
                    'hover:text-foreground hover:bg-primary/10',
                    'transition-all duration-fast'
                  )}
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Organization</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
