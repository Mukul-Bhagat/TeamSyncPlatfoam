# Project Collaboration Module - Permission Matrix

## Overview

This document defines the comprehensive permission matrix for the Project Collaboration Module. Permissions are role-based and hierarchical, with each role inheriting all permissions from lower roles.

## Role Hierarchy

```
Owner > Admin > Manager > Member > Viewer
```

- **Owner**: Full control over the project
- **Admin**: Can manage users, channels, meetings, files
- **Manager**: Can manage tasks, discussions, planning
- **Member**: Can participate in project activities
- **Viewer**: Read-only access to project resources

---

## Permission Matrix

### Project Management

| Action | Owner | Admin | Manager | Member | Viewer |
|--------|-------|-------|---------|--------|--------|
| View project | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit project details | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete project | ✅ | ❌ | ❌ | ❌ | ❌ |
| Archive project | ✅ | ✅ | ❌ | ❌ | ❌ |
| Restore project | ✅ | ✅ | ❌ | ❌ | ❌ |
| Transfer ownership | ✅ | ❌ | ❌ | ❌ | ❌ |
| Change project visibility | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update project settings | ✅ | ✅ | ❌ | ❌ | ❌ |
| View project statistics | ✅ | ✅ | ✅ | ✅ | ✅ |
| View activity logs | ✅ | ✅ | ✅ | ✅ | ✅ |

### Member Management

| Action | Owner | Admin | Manager | Member | Viewer |
|--------|-------|-------|---------|--------|--------|
| View member list | ✅ | ✅ | ✅ | ✅ | ✅ |
| Invite new members | ✅ | ✅ | ❌ | ❌ | ❌ |
| Remove members | ✅ | ✅ | ❌ | ❌ | ❌ |
| Change member roles | ✅ | ✅ | ❌ | ❌ | ❌ |
| Suspend members | ✅ | ✅ | ❌ | ❌ | ❌ |
| Unsuspend members | ✅ | ✅ | ❌ | ❌ | ❌ |
| Promote to admin | ✅ | ❌ | ❌ | ❌ | ❌ |
| Demote from admin | ✅ | ❌ | ❌ | ❌ | ❌ |
| View member activity | ✅ | ✅ | ✅ | ❌ | ❌ |
| Export member list | ✅ | ✅ | ✅ | ❌ | ❌ |

### Channel Management

| Action | Owner | Admin | Manager | Member | Viewer |
|--------|-------|-------|---------|--------|--------|
| View channels | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create channels | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit channels | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete channels | ✅ | ✅ | ❌ | ❌ | ❌ |
| Archive channels | ✅ | ✅ | ✅ | ❌ | ❌ |
| Pin channels | ✅ | ✅ | ✅ | ❌ | ❌ |
| Reorder channels | ✅ | ✅ | ✅ | ❌ | ❌ |
| Change channel visibility | ✅ | ✅ | ✅ | ❌ | ❌ |
| Add channel members | ✅ | ✅ | ✅ | ❌ | ❌ |
| Remove channel members | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage channel roles | ✅ | ✅ | ✅ | ❌ | ❌ |

### Messaging

| Action | Owner | Admin | Manager | Member | Viewer |
|--------|-------|-------|---------|--------|--------|
| View messages | ✅ | ✅ | ✅ | ✅ | ✅ |
| Send messages | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit own messages | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete own messages | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete any message | ✅ | ✅ | ❌ | ❌ | ❌ |
| Pin messages | ✅ | ✅ | ✅ | ✅ | ❌ |
| Star messages | ✅ | ✅ | ✅ | ✅ | ❌ |
| React to messages | ✅ | ✅ | ✅ | ✅ | ❌ |
| Reply to messages | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create threads | ✅ | ✅ | ✅ | ✅ | ❌ |
| Mention users | ✅ | ✅ | ✅ | ✅ | ❌ |
| Mention everyone | ✅ | ✅ | ✅ | ✅ | ❌ |
| Search messages | ✅ | ✅ | ✅ | ✅ | ✅ |
| Forward messages | ✅ | ✅ | ✅ | ✅ | ❌ |
| Copy messages | ✅ | ✅ | ✅ | ✅ | ❌ |

### Message Attachments

| Action | Owner | Admin | Manager | Member | Viewer |
|--------|-------|-------|---------|--------|--------|
| View attachments | ✅ | ✅ | ✅ | ✅ | ✅ |
| Upload attachments | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete own attachments | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete any attachment | ✅ | ✅ | ❌ | ❌ | ❌ |
| Download attachments | ✅ | ✅ | ✅ | ✅ | ✅ |
| Preview attachments | ✅ | ✅ | ✅ | ✅ | ✅ |

### File Management

| Action | Owner | Admin | Manager | Member | Viewer |
|--------|-------|-------|---------|--------|--------|
| View files | ✅ | ✅ | ✅ | ✅ | ✅ |
| Upload files | ✅ | ✅ | ✅ | ✅ | ❌ |
| Create folders | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit file metadata | ✅ | ✅ | ✅ | ✅ | ❌ |
| Move files | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete own files | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete any file | ✅ | ✅ | ❌ | ❌ | ❌ |
| Download files | ✅ | ✅ | ✅ | ✅ | ✅* |
| View file versions | ✅ | ✅ | ✅ | ✅ | ✅ |
| Upload new versions | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete file versions | ✅ | ✅ | ❌ | ❌ | ❌ |
| Restore file versions | ✅ | ✅ | ✅ | ✅ | ❌ |

*Viewer download permission depends on project settings

### Meeting Management

| Action | Owner | Admin | Manager | Member | Viewer |
|--------|-------|-------|---------|--------|--------|
| View meetings | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create meetings | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit own meetings | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit any meeting | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete own meetings | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete any meeting | ✅ | ✅ | ❌ | ❌ | ❌ |
| Start meetings | ✅ | ✅ | ✅ | ✅ | ❌ |
| End meetings | ✅ | ✅ | ✅ | ✅ | ❌ |
| Join meetings | ✅ | ✅ | ✅ | ✅ | ✅ |
| Add participants | ✅ | ✅ | ✅ | ✅ | ❌ |
| Remove participants | ✅ | ✅ | ✅ | ❌ | ❌ |
| View meeting notes | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit meeting notes | ✅ | ✅ | ✅ | ✅ | ❌ |
| View recording | ✅ | ✅ | ✅ | ✅ | ✅ |

### Activity Logs

| Action | Owner | Admin | Manager | Member | Viewer |
|--------|-------|-------|---------|--------|--------|
| View activity logs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Export activity logs | ✅ | ✅ | ✅ | ❌ | ❌ |
| Filter activity logs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Search activity logs | ✅ | ✅ | ✅ | ✅ | ✅ |

### Compliance & Moderation

| Action | Owner | Admin | Manager | Member | Viewer |
|--------|-------|-------|---------|--------|--------|
| Report messages | ✅ | ✅ | ✅ | ✅ | ✅ |
| View reports | ✅ | ✅ | ✅ | ❌ | ❌ |
| Review reports | ✅ | ✅ | ✅ | ❌ | ❌ |
| Resolve reports | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete reported content | ✅ | ✅ | ✅ | ❌ | ❌ |
| View deleted messages | ✅ | ✅ | ❌ | ❌ | ❌ |

### Project Settings

| Action | Owner | Admin | Manager | Member | Viewer |
|--------|-------|-------|---------|--------|--------|
| View settings | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit permissions | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit notification settings | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit file settings | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit meeting settings | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit security settings | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Channel-Specific Permissions

### Channel Roles

| Action | Channel Admin | Channel Moderator | Channel Member |
|--------|---------------|-------------------|---------------|
| View channel | ✅ | ✅ | ✅ |
| Send messages | ✅ | ✅ | ✅ |
| Edit own messages | ✅ | ✅ | ✅ |
| Delete own messages | ✅ | ✅ | ✅ |
| Pin messages | ✅ | ✅ | ❌ |
| Delete any message | ✅ | ❌ | ❌ |
| Add members | ✅ | ✅ | ❌ |
| Remove members | ✅ | ❌ | ❌ |
| Change member roles | ✅ | ❌ | ❌ |
| Mute channel | ✅ | ✅ | ✅ |
| Archive channel | ✅ | ❌ | ❌ |

---

## Permission Inheritance Rules

### Project Role Inheritance

- **Owner**: Inherits all Admin, Manager, Member, and Viewer permissions
- **Admin**: Inherits all Manager, Member, and Viewer permissions
- **Manager**: Inherits all Member and Viewer permissions
- **Member**: Inherits all Viewer permissions
- **Viewer**: Base permissions only

### Channel Role Inheritance

- **Channel Admin**: Inherits all Channel Moderator and Member permissions
- **Channel Moderator**: Inherits all Channel Member permissions
- **Channel Member**: Base channel permissions only

---

## Special Permissions

### Mention Everyone

Only users with the following roles can mention everyone (@all):
- Owner
- Admin
- Manager
- Member

Viewers cannot mention everyone.

### Delete Any Content

Only Owner and Admin can delete any content (messages, files, etc.) regardless of who created it.

### Transfer Ownership

Only the current Owner can transfer ownership to another user.

### Change Project Visibility

Only Owner and Admin can change project visibility (private, internal, public).

### Export Data

Only Owner, Admin, and Manager can export project data (members, activity logs, etc.).

---

## Permission Checks

### Backend Permission Check Pattern

```typescript
async function checkProjectPermission(
  userId: string,
  projectId: string,
  action: string
): Promise<boolean> {
  const member = await getProjectMember(userId, projectId);
  
  if (!member || member.status !== 'active') {
    return false;
  }
  
  const role = member.role;
  return PERMISSION_MATRIX[action]?.[role] || false;
}
```

### RLS Policy Pattern

```sql
CREATE POLICY "Project owners and admins can {action}" ON public.{table}
  FOR {action_type} USING (
    EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = {table}.project_id
        AND pm.user_id = auth.uid()
        AND pm.status = 'active'
        AND pm.role IN ('owner', 'admin')
    )
  );
```

---

## Permission Constants

### Role Constants

```typescript
export enum ProjectRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

export enum ChannelRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member'
}
```

### Action Constants

```typescript
export enum ProjectAction {
  // Project Management
  VIEW_PROJECT = 'view_project',
  EDIT_PROJECT = 'edit_project',
  DELETE_PROJECT = 'delete_project',
  ARCHIVE_PROJECT = 'archive_project',
  TRANSFER_OWNERSHIP = 'transfer_ownership',
  
  // Member Management
  VIEW_MEMBERS = 'view_members',
  INVITE_MEMBERS = 'invite_members',
  REMOVE_MEMBERS = 'remove_members',
  CHANGE_MEMBER_ROLES = 'change_member_roles',
  
  // Channel Management
  VIEW_CHANNELS = 'view_channels',
  CREATE_CHANNELS = 'create_channels',
  EDIT_CHANNELS = 'edit_channels',
  DELETE_CHANNELS = 'delete_channels',
  
  // Messaging
  VIEW_MESSAGES = 'view_messages',
  SEND_MESSAGES = 'send_messages',
  EDIT_MESSAGES = 'edit_messages',
  DELETE_MESSAGES = 'delete_messages',
  PIN_MESSAGES = 'pin_messages',
  
  // File Management
  VIEW_FILES = 'view_files',
  UPLOAD_FILES = 'upload_files',
  DELETE_FILES = 'delete_files',
  DOWNLOAD_FILES = 'download_files',
  
  // Meeting Management
  VIEW_MEETINGS = 'view_meetings',
  CREATE_MEETINGS = 'create_meetings',
  EDIT_MEETINGS = 'edit_meetings',
  DELETE_MEETINGS = 'delete_meetings',
  START_MEETINGS = 'start_meetings',
  
  // Activity Logs
  VIEW_ACTIVITY_LOGS = 'view_activity_logs',
  EXPORT_ACTIVITY_LOGS = 'export_activity_logs'
}
```

---

## Permission Matrix JSON

```json
{
  "permissions": {
    "owner": {
      "view_project": true,
      "edit_project": true,
      "delete_project": true,
      "archive_project": true,
      "transfer_ownership": true,
      "view_members": true,
      "invite_members": true,
      "remove_members": true,
      "change_member_roles": true,
      "view_channels": true,
      "create_channels": true,
      "edit_channels": true,
      "delete_channels": true,
      "view_messages": true,
      "send_messages": true,
      "edit_messages": true,
      "delete_messages": true,
      "pin_messages": true,
      "view_files": true,
      "upload_files": true,
      "delete_files": true,
      "download_files": true,
      "view_meetings": true,
      "create_meetings": true,
      "edit_meetings": true,
      "delete_meetings": true,
      "start_meetings": true,
      "view_activity_logs": true,
      "export_activity_logs": true
    },
    "admin": {
      "view_project": true,
      "edit_project": true,
      "delete_project": false,
      "archive_project": true,
      "transfer_ownership": false,
      "view_members": true,
      "invite_members": true,
      "remove_members": true,
      "change_member_roles": true,
      "view_channels": true,
      "create_channels": true,
      "edit_channels": true,
      "delete_channels": true,
      "view_messages": true,
      "send_messages": true,
      "edit_messages": true,
      "delete_messages": true,
      "pin_messages": true,
      "view_files": true,
      "upload_files": true,
      "delete_files": true,
      "download_files": true,
      "view_meetings": true,
      "create_meetings": true,
      "edit_meetings": true,
      "delete_meetings": true,
      "start_meetings": true,
      "view_activity_logs": true,
      "export_activity_logs": true
    },
    "manager": {
      "view_project": true,
      "edit_project": false,
      "delete_project": false,
      "archive_project": false,
      "transfer_ownership": false,
      "view_members": true,
      "invite_members": false,
      "remove_members": false,
      "change_member_roles": false,
      "view_channels": true,
      "create_channels": true,
      "edit_channels": true,
      "delete_channels": false,
      "view_messages": true,
      "send_messages": true,
      "edit_messages": true,
      "delete_messages": true,
      "pin_messages": true,
      "view_files": true,
      "upload_files": true,
      "delete_files": true,
      "download_files": true,
      "view_meetings": true,
      "create_meetings": true,
      "edit_meetings": true,
      "delete_meetings": true,
      "start_meetings": true,
      "view_activity_logs": true,
      "export_activity_logs": true
    },
    "member": {
      "view_project": true,
      "edit_project": false,
      "delete_project": false,
      "archive_project": false,
      "transfer_ownership": false,
      "view_members": true,
      "invite_members": false,
      "remove_members": false,
      "change_member_roles": false,
      "view_channels": true,
      "create_channels": false,
      "edit_channels": false,
      "delete_channels": false,
      "view_messages": true,
      "send_messages": true,
      "edit_messages": true,
      "delete_messages": true,
      "pin_messages": true,
      "view_files": true,
      "upload_files": true,
      "delete_files": true,
      "download_files": true,
      "view_meetings": true,
      "create_meetings": true,
      "edit_meetings": true,
      "delete_meetings": true,
      "start_meetings": true,
      "view_activity_logs": true,
      "export_activity_logs": false
    },
    "viewer": {
      "view_project": true,
      "edit_project": false,
      "delete_project": false,
      "archive_project": false,
      "transfer_ownership": false,
      "view_members": true,
      "invite_members": false,
      "remove_members": false,
      "change_member_roles": false,
      "view_channels": true,
      "create_channels": false,
      "edit_channels": false,
      "delete_channels": false,
      "view_messages": true,
      "send_messages": false,
      "edit_messages": false,
      "delete_messages": false,
      "pin_messages": false,
      "view_files": true,
      "upload_files": false,
      "delete_files": false,
      "download_files": true,
      "view_meetings": true,
      "create_meetings": false,
      "edit_meetings": false,
      "delete_meetings": false,
      "start_meetings": false,
      "view_activity_logs": true,
      "export_activity_logs": false
    }
  }
}
```

---

## Permission Validation Flow

### Frontend Permission Check

```typescript
function hasPermission(action: ProjectAction): boolean {
  const userRole = currentUser?.projectRole;
  return PERMISSION_MATRIX[action]?.[userRole] || false;
}

// Usage in components
{hasPermission(ProjectAction.CREATE_CHANNELS) && (
  <Button onClick={handleCreateChannel}>Create Channel</Button>
)}
```

### Backend Permission Check

```typescript
async function requirePermission(
  userId: string,
  projectId: string,
  action: ProjectAction
): Promise<void> {
  const hasPermission = await checkProjectPermission(userId, projectId, action);
  
  if (!hasPermission) {
    throw new ForbiddenError('You do not have permission to perform this action');
  }
}
```

### Database RLS Check

```sql
-- Automatic enforcement via RLS policies
-- No additional checks needed in application code
```

---

## Permission Audit

All permission changes are logged in the activity logs:

```json
{
  "action": "role_changed",
  "entity_type": "project_member",
  "entity_id": "uuid",
  "before_data": {
    "role": "member"
  },
  "after_data": {
    "role": "admin"
  },
  "metadata": {
    "changed_by": "uuid",
    "reason": "Promoted to admin"
  }
}
```

---

## Future Expansion

### Additional Roles (Future)

- **Guest**: Limited access, can only view specific channels
- **Contractor**: Time-limited access with specific permissions
- **External Partner**: Access to specific project areas only

### Department-Based Permissions (Future)

- Department-specific roles
- Cross-department permissions
- Department hierarchy

### AI Agent Permissions (Future)

- AI agents with specific read/write permissions
- AI moderation permissions
- AI analytics permissions
