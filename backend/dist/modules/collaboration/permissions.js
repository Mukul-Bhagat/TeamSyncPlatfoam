"use strict";
// Permission Matrix for Project Collaboration
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSION_MATRIX = exports.ProjectAction = void 0;
exports.hasPermission = hasPermission;
exports.requirePermission = requirePermission;
var ProjectAction;
(function (ProjectAction) {
    // Project Management
    ProjectAction["VIEW_PROJECT"] = "view_project";
    ProjectAction["EDIT_PROJECT"] = "edit_project";
    ProjectAction["DELETE_PROJECT"] = "delete_project";
    ProjectAction["ARCHIVE_PROJECT"] = "archive_project";
    ProjectAction["TRANSFER_OWNERSHIP"] = "transfer_ownership";
    // Member Management
    ProjectAction["VIEW_MEMBERS"] = "view_members";
    ProjectAction["INVITE_MEMBERS"] = "invite_members";
    ProjectAction["REMOVE_MEMBERS"] = "remove_members";
    ProjectAction["CHANGE_MEMBER_ROLES"] = "change_member_roles";
    // Channel Management
    ProjectAction["VIEW_CHANNELS"] = "view_channels";
    ProjectAction["CREATE_CHANNELS"] = "create_channels";
    ProjectAction["EDIT_CHANNELS"] = "edit_channels";
    ProjectAction["DELETE_CHANNELS"] = "delete_channels";
    // Messaging
    ProjectAction["VIEW_MESSAGES"] = "view_messages";
    ProjectAction["SEND_MESSAGES"] = "send_messages";
    ProjectAction["EDIT_MESSAGES"] = "edit_messages";
    ProjectAction["DELETE_MESSAGES"] = "delete_messages";
    ProjectAction["PIN_MESSAGES"] = "pin_messages";
    // File Management
    ProjectAction["VIEW_FILES"] = "view_files";
    ProjectAction["UPLOAD_FILES"] = "upload_files";
    ProjectAction["DELETE_FILES"] = "delete_files";
    ProjectAction["DOWNLOAD_FILES"] = "download_files";
    // Meeting Management
    ProjectAction["VIEW_MEETINGS"] = "view_meetings";
    ProjectAction["CREATE_MEETINGS"] = "create_meetings";
    ProjectAction["EDIT_MEETINGS"] = "edit_meetings";
    ProjectAction["DELETE_MEETINGS"] = "delete_meetings";
    ProjectAction["START_MEETINGS"] = "start_meetings";
    // Activity Logs
    ProjectAction["VIEW_ACTIVITY_LOGS"] = "view_activity_logs";
    ProjectAction["EXPORT_ACTIVITY_LOGS"] = "export_activity_logs";
})(ProjectAction || (exports.ProjectAction = ProjectAction = {}));
exports.PERMISSION_MATRIX = {
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
};
function hasPermission(role, action) {
    return exports.PERMISSION_MATRIX[role]?.[action] || false;
}
function requirePermission(role, action) {
    if (!hasPermission(role, action)) {
        throw new Error(`Permission denied: ${action} for role ${role}`);
    }
}
//# sourceMappingURL=permissions.js.map