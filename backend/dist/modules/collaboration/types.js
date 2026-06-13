"use strict";
// Project Collaboration Types
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectVisibility = exports.ProjectStatus = exports.MeetingStatus = exports.MeetingProvider = exports.MessageType = exports.ChannelVisibility = exports.ChannelType = exports.ProjectRole = void 0;
var ProjectRole;
(function (ProjectRole) {
    ProjectRole["OWNER"] = "owner";
    ProjectRole["ADMIN"] = "admin";
    ProjectRole["MANAGER"] = "manager";
    ProjectRole["MEMBER"] = "member";
    ProjectRole["VIEWER"] = "viewer";
})(ProjectRole || (exports.ProjectRole = ProjectRole = {}));
var ChannelType;
(function (ChannelType) {
    ChannelType["GENERAL"] = "general";
    ChannelType["ANNOUNCEMENTS"] = "announcements";
    ChannelType["TEAM_DISCUSSION"] = "team_discussion";
    ChannelType["FILES"] = "files";
    ChannelType["MEETINGS"] = "meetings";
    ChannelType["ACTIVITY"] = "activity";
    ChannelType["CUSTOM"] = "custom";
    ChannelType["DEPARTMENT"] = "department";
    ChannelType["PRIVATE"] = "private";
})(ChannelType || (exports.ChannelType = ChannelType = {}));
var ChannelVisibility;
(function (ChannelVisibility) {
    ChannelVisibility["PUBLIC"] = "public";
    ChannelVisibility["PRIVATE"] = "private";
})(ChannelVisibility || (exports.ChannelVisibility = ChannelVisibility = {}));
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "text";
    MessageType["IMAGE"] = "image";
    MessageType["PDF"] = "pdf";
    MessageType["DOCUMENT"] = "document";
    MessageType["AUDIO"] = "audio";
    MessageType["VOICE_NOTE"] = "voice_note";
    MessageType["VIDEO"] = "video";
    MessageType["SPREADSHEET"] = "spreadsheet";
    MessageType["LINK"] = "link";
    MessageType["MEETING_LINK"] = "meeting_link";
    MessageType["SYSTEM"] = "system";
})(MessageType || (exports.MessageType = MessageType = {}));
var MeetingProvider;
(function (MeetingProvider) {
    MeetingProvider["GOOGLE_MEET"] = "google_meet";
    MeetingProvider["ZOOM"] = "zoom";
    MeetingProvider["MICROSOFT_TEAMS"] = "microsoft_teams";
    MeetingProvider["JITSI"] = "jitsi";
    MeetingProvider["CUSTOM"] = "custom";
})(MeetingProvider || (exports.MeetingProvider = MeetingProvider = {}));
var MeetingStatus;
(function (MeetingStatus) {
    MeetingStatus["SCHEDULED"] = "scheduled";
    MeetingStatus["LIVE"] = "live";
    MeetingStatus["ENDED"] = "ended";
    MeetingStatus["CANCELLED"] = "cancelled";
})(MeetingStatus || (exports.MeetingStatus = MeetingStatus = {}));
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["PLANNING"] = "planning";
    ProjectStatus["ACTIVE"] = "active";
    ProjectStatus["ON_HOLD"] = "on_hold";
    ProjectStatus["COMPLETED"] = "completed";
    ProjectStatus["ARCHIVED"] = "archived";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
var ProjectVisibility;
(function (ProjectVisibility) {
    ProjectVisibility["PRIVATE"] = "private";
    ProjectVisibility["INTERNAL"] = "internal";
    ProjectVisibility["PUBLIC"] = "public";
})(ProjectVisibility || (exports.ProjectVisibility = ProjectVisibility = {}));
//# sourceMappingURL=types.js.map