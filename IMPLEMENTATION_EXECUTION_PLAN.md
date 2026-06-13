# TEAMSYNC IMPLEMENTATION EXECUTION PLAN

**Goal:** Make TeamSync usable by a real team  
**Scope:** TeamSync V1 - Working collaboration platform  
**Method:** Actual source code analysis, no new architecture  
**Date:** May 30, 2026

---

## PHASE 1: CORE ENTITY CREATION

### Task 1.1: Organization Creation Modal

**Dependencies:** None  
**Existing Code to Reuse:**
- `frontend/src/services/organization.service.ts` - `createOrganization()`
- `frontend/src/features/organization/hooks/useOrganizations.ts` - `useCreateOrganization()`
- `frontend/src/components/organization/OrganizationSwitcher.tsx` - Switcher component
- Database: `organizations` table (002_organization_hierarchy.sql)

**Files to Create:**
- `frontend/src/components/organization/CreateOrganizationModal.tsx`

**Files to Modify:**
- `frontend/src/components/organization/OrganizationSwitcher.tsx`

**Exact Implementation:**

**CreateOrganizationModal.tsx:**
```tsx
import { useState } from 'react';
import { useCreateOrganization } from '@/features/organization/hooks/useOrganizations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface CreateOrganizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateOrganizationModal({ open, onOpenChange, onSuccess }: CreateOrganizationModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const createOrganization = useCreateOrganization();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOrganization.mutateAsync({
        name,
        slug,
        description,
      });
      onSuccess?.();
      onOpenChange(false);
      setName('');
      setSlug('');
      setDescription('');
    } catch (error) {
      console.error('Failed to create organization:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createOrganization.isPending}>
              {createOrganization.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Modify OrganizationSwitcher.tsx:**
- Import CreateOrganizationModal
- Add state for modal open/close
- Pass onCreateOrganization to modal
- Wire "Create Organization" button to open modal

**Database Changes:** None (table already exists)

**Routes to Add:** None (modal approach, no new route needed)

**Estimated Complexity:** Low  
**Risk Level:** Low

---

### Task 1.2: Workspace Creation Modal

**Dependencies:** Organization Creation (Task 1.1)  
**Existing Code to Reuse:**
- `frontend/src/services/workspace.service.ts` - `createWorkspace()`
- `frontend/src/features/workspace/hooks/useWorkspaces.ts` - `useCreateWorkspace()`
- `frontend/src/components/workspace/WorkspaceSwitcher.tsx` - Switcher component
- Database: `workspaces` table (002_organization_hierarchy.sql)

**Files to Create:**
- `frontend/src/components/workspace/CreateWorkspaceModal.tsx`

**Files to Modify:**
- `frontend/src/components/workspace/WorkspaceSwitcher.tsx`
- `frontend/src/pages/workspace/WorkspacePage.tsx`

**Exact Implementation:**

**CreateWorkspaceModal.tsx:**
```tsx
import { useState } from 'react';
import { useCreateWorkspace } from '@/features/workspace/hooks/useWorkspaces';
import { useOrganizations } from '@/features/organization/hooks/useOrganizations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface CreateWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId?: string;
  onSuccess?: () => void;
}

export function CreateWorkspaceModal({ open, onOpenChange, organizationId, onSuccess }: CreateWorkspaceModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState(organizationId || '');
  const createWorkspace = useCreateWorkspace();
  const { data: organizations } = useOrganizations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createWorkspace.mutateAsync({
        name,
        slug,
        description,
        organization_id: selectedOrgId,
      });
      onSuccess?.();
      onOpenChange(false);
      setName('');
      setSlug('');
      setDescription('');
    } catch (error) {
      console.error('Failed to create workspace:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="organization">Organization</Label>
              <Select value={selectedOrgId} onValueChange={setSelectedOrgId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations?.map((org) => (
                    <SelectItem key={org.organization_id} value={org.organization_id}>
                      {org.organizations[0]?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createWorkspace.isPending}>
              {createWorkspace.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Modify WorkspaceSwitcher.tsx:**
- Import CreateWorkspaceModal
- Add state for modal open/close
- Pass onCreateWorkspace to modal
- Wire "Create Workspace" button to open modal

**Modify WorkspacePage.tsx:**
- Add "Create Workspace" button if no workspaces exist
- Wire to CreateWorkspaceModal

**Database Changes:** None (table already exists)

**Routes to Add:** None (modal approach, no new route needed)

**Estimated Complexity:** Low  
**Risk Level:** Low

---

### Task 1.3: Project Creation Modal

**Dependencies:** Workspace Creation (Task 1.2)  
**Existing Code to Reuse:**
- `frontend/src/services/project.service.ts` - `createProject()`
- `frontend/src/hooks/useProjects.ts` - `useCreateProject()`
- `frontend/src/pages/dashboard/DashboardPage.tsx` - Dashboard page
- Database: `projects` table (001_initial_schema.sql)

**Files to Create:**
- `frontend/src/components/projects/CreateProjectModal.tsx`

**Files to Modify:**
- `frontend/src/pages/dashboard/DashboardPage.tsx`

**Exact Implementation:**

**CreateProjectModal.tsx:**
```tsx
import { useState } from 'react';
import { useCreateProject } from '@/hooks/useProjects';
import { useWorkspaces } from '@/features/workspace/hooks/useWorkspaces';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId?: string;
  onSuccess?: () => void;
}

export function CreateProjectModal({ open, onOpenChange, workspaceId, onSuccess }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(workspaceId || '');
  const createProject = useCreateProject();
  const { data: organizations } = useOrganizations();
  const { data: workspaces } = useWorkspaces(selectedWorkspaceId || organizations?.[0]?.organization_id || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject.mutateAsync({
        name,
        description,
        workspace_id: selectedWorkspaceId,
      });
      onSuccess?.();
      onOpenChange(false);
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="workspace">Workspace</Label>
              <Select value={selectedWorkspaceId} onValueChange={setSelectedWorkspaceId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select workspace" />
                </SelectTrigger>
                <SelectContent>
                  {workspaces?.map((ws) => (
                    <SelectItem key={ws.id} value={ws.id}>
                      {ws.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Modify DashboardPage.tsx:**
- Import CreateProjectModal
- Add state for modal open/close
- Add "Create Project" button
- Wire to CreateProjectModal

**Database Changes:** None (table already exists)

**Routes to Add:** None (modal approach, no new route needed)

**Estimated Complexity:** Low  
**Risk Level:** Low

---

## PHASE 2: MEMBER MANAGEMENT

### Task 2.1: Member Invitation Modal

**Dependencies:** Organization Creation (Task 1.1), Workspace Creation (Task 1.2)  
**Existing Code to Reuse:**
- `frontend/src/services/organization.service.ts` - `addMember()`
- `frontend/src/features/organization/hooks/useOrganizations.ts` - `useAddMember()`
- Database: `organization_members` table (002_organization_hierarchy.sql)
- Database: `workspace_members` table (002_organization_hierarchy.sql)

**Files to Create:**
- `frontend/src/components/members/InviteMemberModal.tsx`

**Files to Modify:**
- `frontend/src/pages/team/TeamPage.tsx`

**Exact Implementation:**

**InviteMemberModal.tsx:**
```tsx
import { useState } from 'react';
import { useAddMember } from '@/features/organization/hooks/useOrganizations';
import { useAddWorkspaceMember } from '@/features/workspace/hooks/useWorkspaces';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId?: string;
  workspaceId?: string;
  onSuccess?: () => void;
}

export function InviteMemberModal({ open, onOpenChange, organizationId, workspaceId, onSuccess }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'member' | 'admin' | 'owner'>('member');
  const addMember = useAddMember();
  const addWorkspaceMember = useAddWorkspaceMember();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (organizationId) {
        await addMember.mutateAsync({
          organization_id: organizationId,
          user_id: email, // In production, this would be a user lookup
          role,
        });
      }
      if (workspaceId) {
        await addWorkspaceMember.mutateAsync({
          workspace_id: workspaceId,
          user_id: email,
          role,
        });
      }
      onSuccess?.();
      onOpenChange(false);
      setEmail('');
      setRole('member');
    } catch (error) {
      console.error('Failed to invite member:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value: any) => setRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addMember.isPending || addWorkspaceMember.isPending}>
              Invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Modify TeamPage.tsx:**
- Import InviteMemberModal
- Replace empty state with member list
- Add "Invite Member" button
- Wire to InviteMemberModal

**Database Changes:** None (tables already exist)

**Routes to Add:** None (modal approach, no new route needed)

**Estimated Complexity:** Medium  
**Risk Level:** Medium (user lookup logic needs refinement)

---

### Task 2.2: Member List Component

**Dependencies:** Member Invitation Modal (Task 2.1)  
**Existing Code to Reuse:**
- `frontend/src/services/organization.service.ts` - `listOrganizationMembers()`
- `frontend/src/features/organization/hooks/useOrganizations.ts` - `useOrganizationMembers()`
- Database: `organization_members` table with profile join

**Files to Create:**
- `frontend/src/components/members/MemberList.tsx`

**Files to Modify:**
- `frontend/src/pages/team/TeamPage.tsx`

**Exact Implementation:**

**MemberList.tsx:**
```tsx
import { useOrganizationMembers } from '@/features/organization/hooks/useOrganizations';
import { useRemoveMember } from '@/features/organization/hooks/useOrganizations';
import { useUpdateMemberRole } from '@/features/organization/hooks/useOrganizations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreVertical, Trash2, Shield } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MemberListProps {
  organizationId: string;
}

export function MemberList({ organizationId }: MemberListProps) {
  const { data: members, isLoading } = useOrganizationMembers(organizationId);
  const removeMember = useRemoveMember();
  const updateMemberRole = useUpdateMemberRole();

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMember.mutateAsync({ organizationId, userId });
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      await updateMemberRole.mutateAsync({ organizationId, userId, input: { role: role as any } });
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  if (isLoading) return <div>Loading members...</div>;

  return (
    <div className="space-y-2">
      {members?.map((member) => (
        <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={member.profiles?.avatar_url} />
              <AvatarFallback>{member.profiles?.full_name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{member.profiles?.full_name || 'Unknown'}</p>
              <p className="text-sm text-muted-foreground">{member.profiles?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={member.role} onValueChange={(value) => handleUpdateRole(member.user_id, value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveMember(member.user_id)}
              disabled={member.role === 'owner'}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Modify TeamPage.tsx:**
- Import MemberList
- Replace empty state with MemberList component
- Pass organizationId to MemberList

**Database Changes:** None (table already exists)

**Routes to Add:** None

**Estimated Complexity:** Low  
**Risk Level:** Low

---

### Task 2.3: Role Management

**Dependencies:** Member List Component (Task 2.2)  
**Existing Code to Reuse:**
- `frontend/src/services/organization.service.ts` - `updateMemberRole()`
- `frontend/src/features/organization/hooks/useOrganizations.ts` - `useUpdateMemberRole()`

**Files to Modify:**
- `frontend/src/components/members/MemberList.tsx` (already includes role management)

**Exact Implementation:** Role management is already included in MemberList.tsx from Task 2.2

**Database Changes:** None (role column already exists)

**Routes to Add:** None

**Estimated Complexity:** Low  
**Risk Level:** Low

---

## PHASE 3: PROJECT FEED & INTERACTIONS

### Task 3.1: Announcements Channel Type

**Dependencies:** Workspace Creation (Task 1.2)  
**Existing Code to Reuse:**
- `frontend/src/services/channel.service.ts` - `createChannel()`
- `frontend/src/features/channels/hooks/useChannels.ts` - `useCreateChannel()`
- Database: `channels` table with type 'announcement' (003_channels.sql)
- Database: `messages` table with type 'announcement' (004_messages.sql)

**Files to Create:**
- None (use existing channel creation)

**Files to Modify:**
- `frontend/src/components/channels/CreateChannelModal.tsx` (create in Task 3.2)

**Database Changes:** None (announcement type already exists)

**Routes to Add:** None

**Estimated Complexity:** Low  
**Risk Level:** Low

---

### Task 3.2: Channel Creation Modal

**Dependencies:** Workspace Creation (Task 1.2)  
**Existing Code to Reuse:**
- `frontend/src/services/channel.service.ts` - `createChannel()`
- `frontend/src/features/channels/hooks/useChannels.ts` - `useCreateChannel()`
- Database: `channels` table (003_channels.sql)

**Files to Create:**
- `frontend/src/components/channels/CreateChannelModal.tsx`

**Files to Modify:**
- `frontend/src/pages/channels/ChannelsPage.tsx`
- `frontend/src/pages/workspace/WorkspacePage.tsx`

**Exact Implementation:**

**CreateChannelModal.tsx:**
```tsx
import { useState } from 'react';
import { useCreateChannel } from '@/features/channels/hooks/useChannels';
import { useWorkspaces } from '@/features/workspace/hooks/useWorkspaces';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface CreateChannelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId?: string;
  onSuccess?: () => void;
}

export function CreateChannelModal({ open, onOpenChange, workspaceId, onSuccess }: CreateChannelModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'text' | 'voice' | 'announcement'>('text');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(workspaceId || '');
  const createChannel = useCreateChannel();
  const { data: organizations } = useOrganizations();
  const { data: workspaces } = useWorkspaces(selectedWorkspaceId || organizations?.[0]?.organization_id || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createChannel.mutateAsync({
        name,
        slug,
        description,
        type,
        visibility,
        workspace_id: selectedWorkspaceId,
      });
      onSuccess?.();
      onOpenChange(false);
      setName('');
      setSlug('');
      setDescription('');
      setType('text');
      setVisibility('public');
    } catch (error) {
      console.error('Failed to create channel:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="workspace">Workspace</Label>
              <Select value={selectedWorkspaceId} onValueChange={setSelectedWorkspaceId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select workspace" />
                </SelectTrigger>
                <SelectContent>
                  {workspaces?.map((ws) => (
                    <SelectItem key={ws.id} value={ws.id}>
                      {ws.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value: any) => setType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="voice">Voice</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="visibility">Visibility</Label>
              <Select value={visibility} onValueChange={(value: any) => setVisibility(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createChannel.isPending}>
              {createChannel.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Modify ChannelsPage.tsx:**
- Import CreateChannelModal
- Replace empty state with channel list
- Add "Create Channel" button
- Wire to CreateChannelModal

**Modify WorkspacePage.tsx:**
- Add "Create Channel" button
- Wire to CreateChannelModal

**Database Changes:** None (table already exists)

**Routes to Add:** None (modal approach, no new route needed)

**Estimated Complexity:** Low  
**Risk Level:** Low

---

### Task 3.3: Comments on Messages

**Dependencies:** Channel Creation (Task 3.2)  
**Existing Code to Reuse:**
- `frontend/src/services/message.service.ts` - `createMessage()` with `parent_message_id`
- `frontend/src/components/messages/MessageRenderer.tsx` - Message display
- Database: `messages` table with `parent_message_id` (004_messages.sql)

**Files to Create:**
- None (threading already exists in database)

**Files to Modify:**
- `frontend/src/components/messages/MessageRenderer.tsx`

**Exact Implementation:**

**Modify MessageRenderer.tsx:**
- Add "Reply" button to each message
- When clicked, open inline reply editor
- When submitted, call `createMessage` with `parent_message_id`
- Display replies in thread view

**Database Changes:** None (parent_message_id already exists)

**Routes to Add:** None

**Estimated Complexity:** Medium  
**Risk Level:** Low

---

### Task 3.4: Likes on Messages

**Dependencies:** Comments on Messages (Task 3.3)  
**Existing Code to Reuse:**
- `frontend/src/services/message.service.ts` - `addReaction()`, `removeReaction()`
- Database: `message_reactions` table (004_messages.sql)

**Files to Create:**
- None (reaction system already exists in database)

**Files to Modify:**
- `frontend/src/components/messages/MessageRenderer.tsx`

**Exact Implementation:**

**Modify MessageRenderer.tsx:**
- Add "Like" button to each message
- When clicked, call `addReaction` with emoji '👍'
- Display reaction count
- Allow users to remove their like

**Database Changes:** None (message_reactions table already exists)

**Routes to Add:** None

**Estimated Complexity:** Low  
**Risk Level:** Low

---

## PHASE 4: FILE UPLOADS

### Task 4.1: File Upload Component

**Dependencies:** Messaging (already working)  
**Existing Code to Reuse:**
- `frontend/src/services/storage.service.ts` - Storage operations
- `frontend/src/services/message.service.ts` - `uploadAttachment()`
- Database: `message_attachments` table (004_messages.sql)
- Supabase Storage (already configured)

**Files to Create:**
- `frontend/src/components/uploads/FileUploader.tsx`

**Files to Modify:**
- `frontend/src/components/messages/MessageEditor.tsx`

**Exact Implementation:**

**FileUploader.tsx:**
```tsx
import { useState } from 'react';
import { storageService } from '@/services/storage.service';
import { messageService } from '@/services/message.service';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface FileUploaderProps {
  channelId: string;
  onUploadComplete?: (attachmentId: string) => void;
}

export function FileUploader({ channelId, onUploadComplete }: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      for (const file of files) {
        const filePath = `channels/${channelId}/${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await storageService.uploadFile(
          filePath,
          file
        );

        if (uploadError) throw uploadError;

        const attachment = await messageService.uploadAttachment({
          channel_id: channelId,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          storage_path: filePath,
        });

        onUploadComplete?.(attachment.id);
      }
      setFiles([]);
    } catch (error) {
      console.error('Failed to upload files:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button type="button" variant="outline" size="sm" asChild>
            <span>
              <Upload className="h-4 w-4 mr-2" />
              Attach Files
            </span>
          </Button>
        </label>
        {files.length > 0 && (
          <Button onClick={handleUpload} disabled={uploading} size="sm">
            {uploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
          </Button>
        )}
      </div>
      {files.length > 0 && (
        <div className="space-y-1">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
              <span className="text-sm truncate">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setFiles(files.filter((_, i) => i !== index))}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Modify MessageEditor.tsx:**
- Import FileUploader
- Add FileUploader to message editor
- Pass channelId to FileUploader
- Handle upload completion

**Database Changes:** None (message_attachments table already exists)

**Routes to Add:** None

**Estimated Complexity:** Medium  
**Risk Level:** Medium (file upload error handling)

---

### Task 4.2: Image Preview Component

**Dependencies:** File Upload Component (Task 4.1)  
**Existing Code to Reuse:**
- `frontend/src/services/storage.service.ts` - `getPublicUrl()`
- Database: `message_attachments` table

**Files to Create:**
- `frontend/src/components/uploads/FilePreview.tsx`

**Files to Modify:**
- `frontend/src/components/messages/MessageRenderer.tsx`

**Exact Implementation:**

**FilePreview.tsx:**
```tsx
import { storageService } from '@/services/storage.service';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface FilePreviewProps {
  attachment: {
    id: string;
    file_name: string;
    file_type: string;
    storage_path: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FilePreview({ attachment, open, onOpenChange }: FilePreviewProps) {
  const { data: publicUrl } = storageService.getPublicUrl(attachment.storage_path);

  const isImage = attachment.file_type.startsWith('image/');
  const isVideo = attachment.file_type.startsWith('video/');

  const handleDownload = () => {
    if (publicUrl) {
      window.open(publicUrl, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{attachment.file_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isImage && publicUrl && (
            <img src={publicUrl} alt={attachment.file_name} className="w-full rounded-lg" />
          )}
          {isVideo && publicUrl && (
            <video src={publicUrl} controls className="w-full rounded-lg" />
          )}
          {!isImage && !isVideo && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Preview not available for this file type</p>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**Modify MessageRenderer.tsx:**
- Import FilePreview
- Add file attachment display
- Click to open FilePreview dialog

**Database Changes:** None

**Routes to Add:** None

**Estimated Complexity:** Low  
**Risk Level:** Low

---

### Task 4.3: Video Player Component

**Dependencies:** Image Preview Component (Task 4.2)  
**Existing Code to Reuse:**
- FilePreview.tsx (already includes video support)

**Files to Create:**
- None (video support already in FilePreview)

**Files to Modify:**
- None

**Exact Implementation:** Video support already included in FilePreview.tsx from Task 4.2

**Database Changes:** None

**Routes to Add:** None

**Estimated Complexity:** None (already done)  
**Risk Level:** None

---

## PHASE 5: ADVANCED FEATURES

### Task 5.1: AI Panel Enhancement

**Dependencies:** None (AI Panel already working)  
**Existing Code to Reuse:**
- `frontend/src/components/ai/AIContextPanel.tsx` - Already working
- `frontend/src/features/ai/services/ai.service.ts` - Already working
- Backend: `backend/src/modules/ai/service.ts` - Already working
- Database: `ai_summaries`, `ai_insights` tables (007_ai_infrastructure.sql)

**Files to Create:**
- None

**Files to Modify:**
- None (already working)

**Exact Implementation:** AI Panel is already working. No changes needed.

**Database Changes:** None

**Routes to Add:** None

**Estimated Complexity:** None (already done)  
**Risk Level:** None

---

### Task 5.2: Audit Logs Page

**Dependencies:** None  
**Existing Code to Reuse:**
- `frontend/src/services/activity.service.ts` - Already working
- `frontend/src/components/activity/ActivityFeed.tsx` - Already working
- Database: `activity_feed` table (005_notifications.sql)

**Files to Create:**
- None

**Files to Modify:**
- `frontend/src/pages/activity/ActivityPage.tsx`

**Exact Implementation:**

**Modify ActivityPage.tsx:**
- Replace empty state with ActivityFeed component
- Pass organizationId and workspaceId from URL params
- Add filters for date range, user, action type

**Database Changes:** None

**Routes to Add:** None (route already exists)

**Estimated Complexity:** Low  
**Risk Level:** Low

---

### Task 5.3: Workflows List

**Dependencies:** None  
**Existing Code to Reuse:**
- `frontend/src/features/workflows/components/WorkflowList.tsx` - Already working
- `frontend/src/hooks/useWorkflows.ts` - Already working
- Backend: `backend/src/modules/workflows/service.ts` - Already working
- Database: `workflows` table (009_workflow_infrastructure.sql)

**Files to Create:**
- None

**Files to Modify:**
- `frontend/src/pages/workflows/WorkflowCenterPage.tsx`

**Exact Implementation:**

**Modify WorkflowCenterPage.tsx:**
- WorkflowList already integrated
- Add workflow creation UI if needed
- Add workflow execution UI if needed

**Database Changes:** None

**Routes to Add:** None (route already exists)

**Estimated Complexity:** Low  
**Risk Level:** Low

---

## IMPLEMENTATION ORDER

### Week 1: Phase 1 - Core Entity Creation (11 hours)
- Day 1: Task 1.1 - Organization Creation Modal (4 hours)
- Day 2: Task 1.2 - Workspace Creation Modal (4 hours)
- Day 3: Task 1.3 - Project Creation Modal (3 hours)

### Week 2: Phase 2 - Member Management (6 hours)
- Day 1: Task 2.1 - Member Invitation Modal (3 hours)
- Day 2: Task 2.2 - Member List Component (2 hours)
- Day 2: Task 2.3 - Role Management (1 hour)

### Week 3: Phase 3 - Project Feed & Interactions (8 hours)
- Day 1: Task 3.1 - Announcements Channel Type (1 hour)
- Day 1: Task 3.2 - Channel Creation Modal (3 hours)
- Day 2: Task 3.3 - Comments on Messages (2 hours)
- Day 2: Task 3.4 - Likes on Messages (2 hours)

### Week 4: Phase 4 - File Uploads (8 hours)
- Day 1: Task 4.1 - File Upload Component (4 hours)
- Day 2: Task 4.2 - Image Preview Component (2 hours)
- Day 2: Task 4.3 - Video Player Component (2 hours)

### Week 5: Phase 5 - Advanced Features (4 hours)
- Day 1: Task 5.1 - AI Panel Enhancement (0 hours - already working)
- Day 1: Task 5.2 - Audit Logs Page (2 hours)
- Day 1: Task 5.3 - Workflows List (2 hours)

**Total Estimated Time:** 37 hours (5 weeks at 8 hours/week)

---

## SUMMARY

**Total Files to Create:** 7
- CreateOrganizationModal.tsx
- CreateWorkspaceModal.tsx
- CreateProjectModal.tsx
- InviteMemberModal.tsx
- MemberList.tsx
- CreateChannelModal.tsx
- FileUploader.tsx
- FilePreview.tsx

**Total Files to Modify:** 11
- OrganizationSwitcher.tsx
- WorkspaceSwitcher.tsx
- WorkspacePage.tsx
- DashboardPage.tsx
- TeamPage.tsx
- ChannelsPage.tsx
- MessageRenderer.tsx
- MessageEditor.tsx
- ActivityPage.tsx
- WorkflowCenterPage.tsx

**Total Database Changes:** 0 (all tables already exist)

**Total Routes to Add:** 0 (all routes already exist or use modal approach)

**Total Estimated Time:** 37 hours

**Success Criteria:** A real team can sign up, create an organization, create workspaces, create projects, invite members, create channels, send messages, upload files, and view activity logs.
