// Permission Matrix for Project Collaboration

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

export const PERMISSION_MATRIX: Record<string, Record<ProjectAction, boolean>> = {
  owner: {
    [ProjectAction.VIEW_PROJECT]: true,
    [ProjectAction.EDIT_PROJECT]: true,
    [ProjectAction.DELETE_PROJECT]: true,
    [ProjectAction.ARCHIVE_PROJECT]: true,
    [ProjectAction.TRANSFER_OWNERSHIP]: true,
    [ProjectAction.VIEW_MEMBERS]: true,
    [ProjectAction.INVITE_MEMBERS]: true,
    [ProjectAction.REMOVE_MEMBERS]: true,
    [ProjectAction.CHANGE_MEMBER_ROLES]: true,
    [ProjectAction.VIEW_CHANNELS]: true,
    [ProjectAction.CREATE_CHANNELS]: true,
    [ProjectAction.EDIT_CHANNELS]: true,
    [ProjectAction.DELETE_CHANNELS]: true,
    [ProjectAction.VIEW_MESSAGES]: true,
    [ProjectAction.SEND_MESSAGES]: true,
    [ProjectAction.EDIT_MESSAGES]: true,
    [ProjectAction.DELETE_MESSAGES]: true,
    [ProjectAction.PIN_MESSAGES]: true,
    [ProjectAction.VIEW_FILES]: true,
    [ProjectAction.UPLOAD_FILES]: true,
    [ProjectAction.DELETE_FILES]: true,
    [ProjectAction.DOWNLOAD_FILES]: true,
    [ProjectAction.VIEW_MEETINGS]: true,
    [ProjectAction.CREATE_MEETINGS]: true,
    [ProjectAction.EDIT_MEETINGS]: true,
    [ProjectAction.DELETE_MEETINGS]: true,
    [ProjectAction.START_MEETINGS]: true,
    [ProjectAction.VIEW_ACTIVITY_LOGS]: true,
    [ProjectAction.EXPORT_ACTIVITY_LOGS]: true
  },
  admin: {
    [ProjectAction.VIEW_PROJECT]: true,
    [ProjectAction.EDIT_PROJECT]: true,
    [ProjectAction.DELETE_PROJECT]: false,
    [ProjectAction.ARCHIVE_PROJECT]: true,
    [ProjectAction.TRANSFER_OWNERSHIP]: false,
    [ProjectAction.VIEW_MEMBERS]: true,
    [ProjectAction.INVITE_MEMBERS]: true,
    [ProjectAction.REMOVE_MEMBERS]: true,
    [ProjectAction.CHANGE_MEMBER_ROLES]: true,
    [ProjectAction.VIEW_CHANNELS]: true,
    [ProjectAction.CREATE_CHANNELS]: true,
    [ProjectAction.EDIT_CHANNELS]: true,
    [ProjectAction.DELETE_CHANNELS]: true,
    [ProjectAction.VIEW_MESSAGES]: true,
    [ProjectAction.SEND_MESSAGES]: true,
    [ProjectAction.EDIT_MESSAGES]: true,
    [ProjectAction.DELETE_MESSAGES]: true,
    [ProjectAction.PIN_MESSAGES]: true,
    [ProjectAction.VIEW_FILES]: true,
    [ProjectAction.UPLOAD_FILES]: true,
    [ProjectAction.DELETE_FILES]: true,
    [ProjectAction.DOWNLOAD_FILES]: true,
    [ProjectAction.VIEW_MEETINGS]: true,
    [ProjectAction.CREATE_MEETINGS]: true,
    [ProjectAction.EDIT_MEETINGS]: true,
    [ProjectAction.DELETE_MEETINGS]: true,
    [ProjectAction.START_MEETINGS]: true,
    [ProjectAction.VIEW_ACTIVITY_LOGS]: true,
    [ProjectAction.EXPORT_ACTIVITY_LOGS]: true
  },
  manager: {
    [ProjectAction.VIEW_PROJECT]: true,
    [ProjectAction.EDIT_PROJECT]: false,
    [ProjectAction.DELETE_PROJECT]: false,
    [ProjectAction.ARCHIVE_PROJECT]: false,
    [ProjectAction.TRANSFER_OWNERSHIP]: false,
    [ProjectAction.VIEW_MEMBERS]: true,
    [ProjectAction.INVITE_MEMBERS]: false,
    [ProjectAction.REMOVE_MEMBERS]: false,
    [ProjectAction.CHANGE_MEMBER_ROLES]: false,
    [ProjectAction.VIEW_CHANNELS]: true,
    [ProjectAction.CREATE_CHANNELS]: true,
    [ProjectAction.EDIT_CHANNELS]: true,
    [ProjectAction.DELETE_CHANNELS]: false,
    [ProjectAction.VIEW_MESSAGES]: true,
    [ProjectAction.SEND_MESSAGES]: true,
    [ProjectAction.EDIT_MESSAGES]: true,
    [ProjectAction.DELETE_MESSAGES]: true,
    [ProjectAction.PIN_MESSAGES]: true,
    [ProjectAction.VIEW_FILES]: true,
    [ProjectAction.UPLOAD_FILES]: true,
    [ProjectAction.DELETE_FILES]: true,
    [ProjectAction.DOWNLOAD_FILES]: true,
    [ProjectAction.VIEW_MEETINGS]: true,
    [ProjectAction.CREATE_MEETINGS]: true,
    [ProjectAction.EDIT_MEETINGS]: true,
    [ProjectAction.DELETE_MEETINGS]: true,
    [ProjectAction.START_MEETINGS]: true,
    [ProjectAction.VIEW_ACTIVITY_LOGS]: true,
    [ProjectAction.EXPORT_ACTIVITY_LOGS]: true
  },
  member: {
    [ProjectAction.VIEW_PROJECT]: true,
    [ProjectAction.EDIT_PROJECT]: false,
    [ProjectAction.DELETE_PROJECT]: false,
    [ProjectAction.ARCHIVE_PROJECT]: false,
    [ProjectAction.TRANSFER_OWNERSHIP]: false,
    [ProjectAction.VIEW_MEMBERS]: true,
    [ProjectAction.INVITE_MEMBERS]: false,
    [ProjectAction.REMOVE_MEMBERS]: false,
    [ProjectAction.CHANGE_MEMBER_ROLES]: false,
    [ProjectAction.VIEW_CHANNELS]: true,
    [ProjectAction.CREATE_CHANNELS]: false,
    [ProjectAction.EDIT_CHANNELS]: false,
    [ProjectAction.DELETE_CHANNELS]: false,
    [ProjectAction.VIEW_MESSAGES]: true,
    [ProjectAction.SEND_MESSAGES]: true,
    [ProjectAction.EDIT_MESSAGES]: true,
    [ProjectAction.DELETE_MESSAGES]: true,
    [ProjectAction.PIN_MESSAGES]: true,
    [ProjectAction.VIEW_FILES]: true,
    [ProjectAction.UPLOAD_FILES]: true,
    [ProjectAction.DELETE_FILES]: true,
    [ProjectAction.DOWNLOAD_FILES]: true,
    [ProjectAction.VIEW_MEETINGS]: true,
    [ProjectAction.CREATE_MEETINGS]: true,
    [ProjectAction.EDIT_MEETINGS]: true,
    [ProjectAction.DELETE_MEETINGS]: true,
    [ProjectAction.START_MEETINGS]: true,
    [ProjectAction.VIEW_ACTIVITY_LOGS]: true,
    [ProjectAction.EXPORT_ACTIVITY_LOGS]: false
  },
  viewer: {
    [ProjectAction.VIEW_PROJECT]: true,
    [ProjectAction.EDIT_PROJECT]: false,
    [ProjectAction.DELETE_PROJECT]: false,
    [ProjectAction.ARCHIVE_PROJECT]: false,
    [ProjectAction.TRANSFER_OWNERSHIP]: false,
    [ProjectAction.VIEW_MEMBERS]: true,
    [ProjectAction.INVITE_MEMBERS]: false,
    [ProjectAction.REMOVE_MEMBERS]: false,
    [ProjectAction.CHANGE_MEMBER_ROLES]: false,
    [ProjectAction.VIEW_CHANNELS]: true,
    [ProjectAction.CREATE_CHANNELS]: false,
    [ProjectAction.EDIT_CHANNELS]: false,
    [ProjectAction.DELETE_CHANNELS]: false,
    [ProjectAction.VIEW_MESSAGES]: true,
    [ProjectAction.SEND_MESSAGES]: false,
    [ProjectAction.EDIT_MESSAGES]: false,
    [ProjectAction.DELETE_MESSAGES]: false,
    [ProjectAction.PIN_MESSAGES]: false,
    [ProjectAction.VIEW_FILES]: true,
    [ProjectAction.UPLOAD_FILES]: false,
    [ProjectAction.DELETE_FILES]: false,
    [ProjectAction.DOWNLOAD_FILES]: true,
    [ProjectAction.VIEW_MEETINGS]: true,
    [ProjectAction.CREATE_MEETINGS]: false,
    [ProjectAction.EDIT_MEETINGS]: false,
    [ProjectAction.DELETE_MEETINGS]: false,
    [ProjectAction.START_MEETINGS]: false,
    [ProjectAction.VIEW_ACTIVITY_LOGS]: true,
    [ProjectAction.EXPORT_ACTIVITY_LOGS]: false
  }
}

export function hasPermission(role: string, action: ProjectAction): boolean {
  return PERMISSION_MATRIX[role]?.[action] || false
}

export function requirePermission(role: string, action: ProjectAction): void {
  if (!hasPermission(role, action)) {
    throw new Error(`Permission denied: ${action} for role ${role}`)
  }
}
