export declare enum ProjectAction {
    VIEW_PROJECT = "view_project",
    EDIT_PROJECT = "edit_project",
    DELETE_PROJECT = "delete_project",
    ARCHIVE_PROJECT = "archive_project",
    TRANSFER_OWNERSHIP = "transfer_ownership",
    VIEW_MEMBERS = "view_members",
    INVITE_MEMBERS = "invite_members",
    REMOVE_MEMBERS = "remove_members",
    CHANGE_MEMBER_ROLES = "change_member_roles",
    VIEW_CHANNELS = "view_channels",
    CREATE_CHANNELS = "create_channels",
    EDIT_CHANNELS = "edit_channels",
    DELETE_CHANNELS = "delete_channels",
    VIEW_MESSAGES = "view_messages",
    SEND_MESSAGES = "send_messages",
    EDIT_MESSAGES = "edit_messages",
    DELETE_MESSAGES = "delete_messages",
    PIN_MESSAGES = "pin_messages",
    VIEW_FILES = "view_files",
    UPLOAD_FILES = "upload_files",
    DELETE_FILES = "delete_files",
    DOWNLOAD_FILES = "download_files",
    VIEW_MEETINGS = "view_meetings",
    CREATE_MEETINGS = "create_meetings",
    EDIT_MEETINGS = "edit_meetings",
    DELETE_MEETINGS = "delete_meetings",
    START_MEETINGS = "start_meetings",
    VIEW_ACTIVITY_LOGS = "view_activity_logs",
    EXPORT_ACTIVITY_LOGS = "export_activity_logs"
}
export declare const PERMISSION_MATRIX: Record<string, Record<ProjectAction, boolean>>;
export declare function hasPermission(role: string, action: ProjectAction): boolean;
export declare function requirePermission(role: string, action: ProjectAction): void;
//# sourceMappingURL=permissions.d.ts.map