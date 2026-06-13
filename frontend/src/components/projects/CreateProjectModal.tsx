import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Building2,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Hash,
  Mail,
  Palette,
  Plus,
  Shield,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreateProject } from '@/hooks/useProjects';
import { useToast } from '@/components/common/Toast';
import {
  PROJECT_ROLE_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  ProjectRole,
  ProjectStatus,
} from '@/features/projects/types/project.types';
import type { Project } from '@/types';
import { useWorkspaceContextStore } from '@/store/workspace-context.store';
import { useOrganizations, useCreateOrganization } from '@/features/organization/hooks/useOrganizations';
import { useWorkspace, useWorkspaces } from '@/features/workspace/hooks/useWorkspaces';

/* eslint-disable react-hooks/set-state-in-effect */

const statusValues = [
  ProjectStatus.PLANNING,
  ProjectStatus.ACTIVE,
  ProjectStatus.ON_HOLD,
  ProjectStatus.COMPLETED,
  ProjectStatus.ARCHIVED,
] as const;

const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').default(''),
  status: z.enum(statusValues),
  color: z.string().regex(/^#([0-9A-Fa-f]{6})$/, 'Color must be a valid hex value'),
  icon: z.string().max(4, 'Icon must be short').default('🚀'),
});

type CreateProjectFormInput = z.input<typeof createProjectSchema>;
type CreateProjectFormData = z.output<typeof createProjectSchema>;

interface PendingMemberDraft {
  id: string;
  email: string;
  role: ProjectRole;
}

interface CreateProjectModalProps {
  workspaceId?: string;
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (project: Project) => void;
}

const WIZARD_STEPS = [
  { label: 'Basics', description: 'Project name and workspace' },
  { label: 'Branding & Access', description: 'Visuals and invite-only access' },
  { label: 'Invite Teammates & Review', description: 'Invite members and create' },
] as const;

const ICON_OPTIONS = ['🚀', '✨', '📦', '🧠', '🎯', '⚡', '💬', '📣', '🛠️', '🧪'];

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function generateDraftId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function CreateProjectModal({
  workspaceId,
  isOpen,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const { toast } = useToast();
  const createProject = useCreateProject();
  const createOrganization = useCreateOrganization();
  const { workspaceId: storedWorkspaceId, organizationId: storedOrganizationId } =
    useWorkspaceContextStore();
  const { data: organizations = [], isLoading: organizationsLoading } = useOrganizations();

  const [step, setStep] = useState(0);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState('');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🚀');
  const [pendingMembers, setPendingMembers] = useState<PendingMemberDraft[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<ProjectRole>(ProjectRole.DEVELOPER);
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [skipOrganization, setSkipOrganization] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<CreateProjectFormInput, undefined, CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: ProjectStatus.PLANNING,
      color: '#6366f1',
      icon: '🚀',
    },
  });

  const projectName = useWatch({ control, name: 'name' });
  const selectedStatus = useWatch({ control, name: 'status' });
  const selectedColor = useWatch({ control, name: 'color' });

  const preselectedWorkspaceId = workspaceId || storedWorkspaceId || '';
  const { data: preselectedWorkspace } = useWorkspace(preselectedWorkspaceId);

  useEffect(() => {
    if (!isOpen) return;

    if (preselectedWorkspaceId) {
      setSelectedWorkspaceId(preselectedWorkspaceId);
    }
  }, [isOpen, preselectedWorkspaceId]);

  useEffect(() => {
    if (!isOpen) return;

    const orgId =
      preselectedWorkspace?.organization_id || storedOrganizationId || organizations[0]?.organization_id || '';

    if (orgId) {
      setSelectedOrganizationId(orgId);
    }
  }, [isOpen, organizations, preselectedWorkspace?.organization_id, storedOrganizationId]);

  const resolvedOrganizationId =
    selectedOrganizationId ||
    preselectedWorkspace?.organization_id ||
    storedOrganizationId ||
    organizations[0]?.organization_id ||
    '';

  const { data: workspaces = [], isLoading: workspacesLoading } = useWorkspaces(resolvedOrganizationId);

  useEffect(() => {
    if (!isOpen) return;
    if (!resolvedOrganizationId || workspacesLoading) return;

    if (selectedWorkspaceId && workspaces.some((workspace) => workspace.id === selectedWorkspaceId)) {
      return;
    }

    if (selectedWorkspaceId && !workspaces.some((workspace) => workspace.id === selectedWorkspaceId)) {
      setSelectedWorkspaceId('');
    }
  }, [isOpen, resolvedOrganizationId, selectedWorkspaceId, workspaces, workspacesLoading]);

  useEffect(() => {
    if (!isOpen) return;
    if (organizationsLoading) return;

    if (selectedOrganizationId && !organizations.some((org) => org.organization_id === selectedOrganizationId)) {
      setSelectedOrganizationId(organizations[0]?.organization_id || '');
    }
  }, [isOpen, organizations, organizationsLoading, selectedOrganizationId]);

  useEffect(() => {
    if (!isOpen) {
      reset();
      setStep(0);
      setSelectedOrganizationId('');
      setSelectedWorkspaceId('');
      setSelectedIcon('🚀');
      setPendingMembers([]);
      setInviteEmail('');
      setInviteRole(ProjectRole.DEVELOPER);
      setShowCreateOrgModal(false);
      setNewOrgName('');
      setSkipOrganization(false);
    }
  }, [isOpen, reset]);

  const selectedWorkspace = useMemo(() => {
    return workspaces.find((workspace) => workspace.id === selectedWorkspaceId);
  }, [selectedWorkspaceId, workspaces]);

  const memberCountLabel = useMemo(() => {
    return `${pendingMembers.length} invite${pendingMembers.length === 1 ? '' : 's'}`;
  }, [pendingMembers.length]);

  const resetInviteForm = () => {
    setPendingMembers([]);
    setInviteEmail('');
    setInviteRole(ProjectRole.DEVELOPER);
  };

  const closeModal = () => {
    reset();
    setStep(0);
    setSelectedOrganizationId('');
    setSelectedWorkspaceId('');
    setSelectedIcon('🚀');
    resetInviteForm();
    setShowCreateOrgModal(false);
    setNewOrgName('');
    setSkipOrganization(false);
    onClose();
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) {
      toast.error('Organization name is required');
      return;
    }

    try {
      const result = await createOrganization.mutateAsync({
        name: newOrgName.trim(),
        slug: newOrgName.trim().toLowerCase().replace(/\s+/g, '-'),
      });

      if (result) {
        // The mutation hook automatically invalidates and refetches organizations
        // Wait a moment for the data to update
        setTimeout(() => {
          const updatedOrgs = organizations || [];
          const newOrg = updatedOrgs.find((org) => org.organizations?.id === result.id);
          if (newOrg) {
            setSelectedOrganizationId(newOrg.organization_id);
            setSkipOrganization(false);
          }
        }, 500);
        
        setShowCreateOrgModal(false);
        setNewOrgName('');
        toast.success('Organization created successfully');
      }
    } catch (error) {
      console.error('Failed to create organization:', error);
      toast.error('Failed to create organization');
    }
  };

  const handleOrganizationChange = (value: string) => {
    if (value === 'create') {
      setShowCreateOrgModal(true);
      return;
    }

    if (value === 'skip') {
      setSkipOrganization(true);
      setSelectedOrganizationId('');
      setSelectedWorkspaceId('');
      return;
    }

    setSkipOrganization(false);
    setSelectedOrganizationId(value);
    setSelectedWorkspaceId('');
  };

  const addPendingMember = () => {
    const normalizedEmail = normalizeEmail(inviteEmail);

    if (!normalizedEmail) {
      toast.error('Enter an email address to invite');
      return;
    }

    const emailValidation = z.string().email().safeParse(normalizedEmail);
    if (!emailValidation.success) {
      toast.error('Enter a valid email address');
      return;
    }

    if (pendingMembers.some((member) => normalizeEmail(member.email) === normalizedEmail)) {
      toast.error('That email is already in the invite list');
      return;
    }

    setPendingMembers((current) => [
      ...current,
      {
        id: generateDraftId(),
        email: normalizedEmail,
        role: inviteRole,
      },
    ]);
    setInviteEmail('');
  };

  const removePendingMember = (id: string) => {
    setPendingMembers((current) => current.filter((member) => member.id !== id));
  };

  const handleNextStep = async () => {
    if (step === 0) {
      const validName = await trigger('name');
      if (!validName) {
        return;
      }

      if (!skipOrganization && !selectedWorkspaceId) {
        toast.error('Choose a workspace to continue');
        return;
      }

      setStep(1);
      return;
    }

    if (step === 1) {
      setStep(2);
    }
  };

  const onSubmit = async (data: CreateProjectFormData) => {
    if (!skipOrganization && !selectedWorkspaceId) {
      toast.error('Choose a workspace before creating the project');
      setStep(0);
      return;
    }

    try {
      const response = await createProject.mutateAsync({
        name: data.name.trim(),
        description: data.description.trim() || undefined,
        workspace_id: skipOrganization ? undefined : selectedWorkspaceId,
        status: data.status,
        icon: selectedIcon,
        color: data.color,
        members: pendingMembers.map(({ email, role }) => ({ email, role })),
      });

      if (response.data) {
        onCreated?.(response.data);
        closeModal();
      }
    } catch {
      // Error toast is handled by the mutation hook.
    }
  };

  if (!isOpen) return null;

  const wizardProgress = WIZARD_STEPS.map((wizardStep, index) => ({
    ...wizardStep,
    active: index === step,
    complete: index < step,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={closeModal} />

      <div className="relative flex h-[min(94vh,46rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-glass-border bg-glass shadow-elevation-lg backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-glass-border px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-foreground sm:text-xl">Create Project</h2>
              <p className="max-w-xl text-sm text-muted-foreground">
                Three quick steps to create an invite-only project and bring the right teammates in.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close project wizard"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
          <div className="border-b border-glass-border px-4 py-3 sm:px-6">
            <div className="grid grid-cols-3 gap-2">
              {wizardProgress.map((wizardStep, index) => (
                <div
                  key={wizardStep.label}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-2xl border px-2 py-2 text-center transition-colors sm:flex-row sm:items-center sm:gap-3 sm:px-3 sm:text-left',
                    wizardStep.active
                      ? 'border-primary/40 bg-primary/10'
                      : wizardStep.complete
                        ? 'border-emerald-500/30 bg-emerald-500/10'
                        : 'border-glass-border bg-background/30'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                      wizardStep.active
                        ? 'bg-primary text-primary-foreground'
                        : wizardStep.complete
                          ? 'bg-emerald-500 text-white'
                          : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {wizardStep.complete ? (
                      <span>✓</span>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-medium leading-tight text-foreground sm:text-sm">
                      {wizardStep.label}
                    </p>
                    <p className="hidden truncate text-xs text-muted-foreground sm:block">
                      {wizardStep.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-6">
            {step === 0 && (
              <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <section className="space-y-4 rounded-3xl border border-glass-border bg-background/40 p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Basics</p>
                      <p className="text-xs text-muted-foreground">Start with a name and the workspace it belongs to.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Project Name</label>
                    <input
                      {...register('name')}
                      placeholder="Launch campaign"
                      className={cn(
                        'w-full rounded-2xl border border-glass-border bg-background/70 px-4 py-3 text-sm text-foreground',
                        'placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring',
                        errors.name && 'border-danger'
                      )}
                    />
                    {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Description</label>
                    <textarea
                      {...register('description')}
                      rows={4}
                      placeholder="What is this project for?"
                      className={cn(
                        'w-full resize-none rounded-2xl border border-glass-border bg-background/70 px-4 py-3 text-sm text-foreground',
                        'placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring'
                      )}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Organization</label>
                      <select
                        value={selectedOrganizationId || (skipOrganization ? 'skip' : '')}
                        onChange={(event) => handleOrganizationChange(event.target.value)}
                        className="w-full rounded-2xl border border-glass-border bg-background/70 px-3 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="" disabled>
                          Select an organization
                        </option>
                        {organizations.map((organization) => (
                          <option key={organization.organization_id} value={organization.organization_id}>
                            {organization.organizations?.name || organization.organization_id}
                          </option>
                        ))}
                        <option value="create" className="font-medium text-primary">
                          + Create Organization
                        </option>
                        <option value="skip" className="text-muted-foreground">
                          Skip (No Organization)
                        </option>
                      </select>
                    </div>

                    {!skipOrganization && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Workspace</label>
                        <select
                          value={selectedWorkspaceId}
                          onChange={(event) => setSelectedWorkspaceId(event.target.value)}
                          className="w-full rounded-2xl border border-glass-border bg-background/70 px-3 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="" disabled>
                            {workspaces.length > 0 ? 'Select a workspace' : 'No workspaces available'}
                          </option>
                          {workspaces.map((workspace) => (
                            <option key={workspace.id} value={workspace.id}>
                              {workspace.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </section>

                <aside className="hidden space-y-4 rounded-3xl border border-glass-border bg-background/30 p-4 sm:p-5 lg:block">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Preview</p>
                      <p className="text-xs text-muted-foreground">A quick glance at what you are about to build.</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-glass-border bg-background/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">Project</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {projectName?.trim() || 'Untitled project'}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedWorkspace?.name || 'Choose a workspace to continue'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-glass-border bg-background/60 p-4">
                    <p className="text-sm font-medium text-foreground">What happens next</p>
                    <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                        Set branding and lock access to invite-only.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                        Add teammates by email and create the project in one pass.
                      </li>
                    </ul>
                  </div>
                </aside>
              </div>
            )}

            {step === 1 && (
              <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_0.9fr]">
                <section className="space-y-4 rounded-3xl border border-glass-border bg-background/40 p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Branding</p>
                      <p className="text-xs text-muted-foreground">Give the project a look that stands out in the workspace.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Status</label>
                    <div className="flex flex-wrap gap-2">
                      {PROJECT_STATUS_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setValue('status', option.value, { shouldDirty: true })}
                          className={cn(
                            'rounded-full border px-4 py-2 text-sm font-medium transition-all',
                            selectedStatus === option.value
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-glass-border bg-background/70 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[auto,1fr] sm:items-center">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Color</label>
                      <input
                        type="color"
                        {...register('color')}
                        className="h-12 w-16 cursor-pointer rounded-2xl border border-glass-border bg-background/70 p-1"
                      />
                    </div>
                    <div className="rounded-2xl border border-glass-border bg-background/60 px-4 py-3">
                      <p className="text-sm font-medium text-foreground">Project accent</p>
                      <p className="text-xs text-muted-foreground">
                        This color is used for project cards and small UI accents.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Icon</label>
                    <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                      {ICON_OPTIONS.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => {
                            setSelectedIcon(icon);
                            setValue('icon', icon, { shouldDirty: true });
                          }}
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition-all',
                            selectedIcon === icon
                              ? 'border-primary bg-primary/15'
                              : 'border-glass-border bg-background/70 hover:border-primary/40'
                          )}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                <aside className="hidden space-y-4 rounded-3xl border border-glass-border bg-background/30 p-4 sm:p-5 lg:block">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Access</p>
                      <p className="text-xs text-muted-foreground">Projects are invite-only and visible only to active members.</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-glass-border bg-background/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Private project</p>
                        <p className="text-xs text-muted-foreground">
                          No workspace-wide visibility, no public access.
                        </p>
                      </div>
                      <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                        Private
                      </span>
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                      <p className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                        Owner and active members can see the project.
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                        Accepted invitees are added to private project channels automatically.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-glass-border bg-background/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">Preview</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl"
                        style={{ backgroundColor: selectedColor || '#6366f1' }}
                      >
                        {selectedIcon}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {projectName?.trim() || 'Untitled project'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {PROJECT_STATUS_OPTIONS.find((option) => option.value === selectedStatus)?.label || 'Planning'}
                        </p>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            )}

            {step === 2 && (
              <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <section className="space-y-4 rounded-3xl border border-glass-border bg-background/40 p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Invite teammates</p>
                      <p className="text-xs text-muted-foreground">Add people by email before you create the project.</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          value={inviteEmail}
                          onChange={(event) => setInviteEmail(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              addPendingMember();
                            }
                          }}
                          placeholder="name@company.com"
                          className="w-full rounded-2xl border border-glass-border bg-background/70 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role</label>
                      <select
                        value={inviteRole}
                        onChange={(event) => setInviteRole(event.target.value as ProjectRole)}
                        className="w-full rounded-2xl border border-glass-border bg-background/70 px-3 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {PROJECT_ROLE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={addPendingMember}
                    className="inline-flex items-center gap-2 rounded-2xl border border-glass-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                    Add invite
                  </button>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">Pending invites</p>
                      <span className="text-xs text-muted-foreground">{memberCountLabel}</span>
                    </div>

                    {pendingMembers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {pendingMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-2 rounded-full border border-glass-border bg-background/70 px-3 py-2"
                          >
                            <span className="max-w-[11rem] truncate text-sm text-foreground">{member.email}</span>
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                              {member.role}
                            </span>
                            <button
                              type="button"
                              onClick={() => removePendingMember(member.id)}
                              className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              aria-label={`Remove ${member.email}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-glass-border px-4 py-5 text-center">
                        <p className="text-sm text-muted-foreground">No pending invites yet.</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Add the people who should have access from day one.
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                <aside className="hidden space-y-4 rounded-3xl border border-glass-border bg-background/30 p-4 sm:p-5 lg:block">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Review</p>
                      <p className="text-xs text-muted-foreground">Double-check the project before you create it.</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-glass-border bg-background/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">Project summary</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {projectName?.trim() || 'Untitled project'}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedWorkspace?.name || 'No workspace selected'}
                    </p>

                    <div className="mt-4 grid gap-3 text-sm">
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-glass-border bg-background/50 px-3 py-2">
                        <span className="text-muted-foreground">Status</span>
                        <span className="font-medium text-foreground">
                          {PROJECT_STATUS_OPTIONS.find((option) => option.value === selectedStatus)?.label || 'Planning'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-glass-border bg-background/50 px-3 py-2">
                        <span className="text-muted-foreground">Access</span>
                        <span className="font-medium text-primary">Private</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-glass-border bg-background/50 px-3 py-2">
                        <span className="text-muted-foreground">Invites</span>
                        <span className="font-medium text-foreground">{memberCountLabel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-glass-border bg-background/60 p-4">
                    <p className="text-sm font-medium text-foreground">Invite flow</p>
                    <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                      <p className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                        Existing users gain access as soon as they sign in with the invited email.
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                        New users can sign up first, then sign in to claim the invitation.
                      </p>
                    </div>
                  </div>
                </aside>
              </div>
            )}
          </div>

          <div className="border-t border-glass-border px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-2xl border border-glass-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  disabled={createProject.isPending}
                >
                  Cancel
                </button>

                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStep((current) => Math.max(current - 1, 0))}
                    className="inline-flex items-center gap-2 rounded-2xl border border-glass-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    disabled={createProject.isPending}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                ) : null}
              </div>

              <div className="flex items-center gap-3">
                {step < 2 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={
                      createProject.isPending ||
                      (step === 0 && !skipOrganization && (!selectedWorkspaceId || organizationsLoading || workspacesLoading))
                    }
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {step === 0 ? 'Continue to Branding' : 'Continue to Review'}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={createProject.isPending}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {createProject.isPending ? 'Creating...' : 'Create Project'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Create Organization Modal */}
      {showCreateOrgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setShowCreateOrgModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-glass-border bg-glass p-6 shadow-elevation-lg backdrop-blur-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Create Organization</h3>
                <p className="text-sm text-muted-foreground">Create a new organization to organize your workspaces.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Organization Name</label>
                <input
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full rounded-2xl border border-glass-border bg-background/70 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateOrganization();
                    }
                  }}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateOrgModal(false)}
                  className="flex-1 rounded-2xl border border-glass-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateOrganization}
                  disabled={createOrganization.isPending || !newOrgName.trim()}
                  className="flex-1 rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {createOrganization.isPending ? 'Creating...' : 'Create Organization'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
