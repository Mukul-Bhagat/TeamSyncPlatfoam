"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collaborationRoutes = collaborationRoutes;
const supabase_js_1 = require("@supabase/supabase-js");
const organization_service_1 = require("./services/organization.service");
const workspace_service_1 = require("./services/workspace.service");
const project_service_1 = require("./services/project.service");
const channel_service_1 = require("./services/channel.service");
const message_service_1 = require("./services/message.service");
const file_service_1 = require("./services/file.service");
const meeting_service_1 = require("./services/meeting.service");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
// Services instances
const orgService = new organization_service_1.OrganizationService();
const workspaceService = new workspace_service_1.WorkspaceService();
const projectService = new project_service_1.ProjectService();
const channelService = new channel_service_1.ChannelService();
const messageService = new message_service_1.MessageService();
const fileService = new file_service_1.FileService();
const meetingService = new meeting_service_1.MeetingService();
// Helper to authenticate user from headers
async function authenticate(request, reply) {
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
        reply.status(401).send({ error: 'Missing authorization header' });
        throw new Error('Unauthorized');
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
        reply.status(401).send({ error: 'Unauthorized: Invalid token' });
        throw new Error('Unauthorized');
    }
    return user.id;
}
async function collaborationRoutes(fastify) {
    // ==========================================
    // ORGANIZATIONS
    // ==========================================
    fastify.get('/organizations', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const data = await orgService.getOrganizations(userId);
        return reply.send(data);
    });
    fastify.get('/organizations/:id', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const data = await orgService.getOrganizationById(id, userId);
        return reply.send(data);
    });
    fastify.post('/organizations', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { name, slug, logo_url } = request.body;
        const data = await orgService.createOrganization(userId, name, slug, logo_url);
        return reply.send(data);
    });
    fastify.put('/organizations/:id', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const body = request.body;
        const data = await orgService.updateOrganization(id, userId, body);
        return reply.send(data);
    });
    fastify.delete('/organizations/:id', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        await orgService.deleteOrganization(id, userId);
        return reply.send({ success: true });
    });
    fastify.get('/organizations/:id/members', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const data = await orgService.getOrganizationMembers(id, userId);
        return reply.send(data);
    });
    fastify.post('/organizations/:id/members', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const { email, role } = request.body;
        const data = await orgService.addOrganizationMember(id, userId, email, role);
        return reply.send(data);
    });
    fastify.delete('/organizations/:id/members/:memberUserId', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id, memberUserId } = request.params;
        await orgService.removeOrganizationMember(id, userId, memberUserId);
        return reply.send({ success: true });
    });
    fastify.put('/organizations/:id/members/:memberUserId/role', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id, memberUserId } = request.params;
        const { role } = request.body;
        const data = await orgService.updateOrganizationMemberRole(id, userId, memberUserId, role);
        return reply.send(data);
    });
    // ==========================================
    // WORKSPACES
    // ==========================================
    fastify.get('/workspaces', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { organization_id } = request.query;
        const data = await workspaceService.getWorkspaces(organization_id || null, userId);
        return reply.send(data);
    });
    fastify.get('/workspaces/:id', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const data = await workspaceService.getWorkspaceById(id, userId);
        return reply.send(data);
    });
    fastify.post('/workspaces', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { organization_id, name, slug, description, icon } = request.body;
        const data = await workspaceService.createWorkspace(userId, organization_id, name, slug, description, icon);
        return reply.send(data);
    });
    fastify.put('/workspaces/:id', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const body = request.body;
        const data = await workspaceService.updateWorkspace(id, userId, body);
        return reply.send(data);
    });
    fastify.delete('/workspaces/:id', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        await workspaceService.deleteWorkspace(id, userId);
        return reply.send({ success: true });
    });
    fastify.get('/workspaces/:id/members', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const data = await workspaceService.getWorkspaceMembers(id, userId);
        return reply.send(data);
    });
    fastify.post('/workspaces/:id/members', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const { email, role } = request.body;
        const data = await workspaceService.addWorkspaceMember(id, userId, email, role);
        return reply.send(data);
    });
    fastify.delete('/workspaces/:id/members/:memberUserId', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id, memberUserId } = request.params;
        await workspaceService.removeWorkspaceMember(id, userId, memberUserId);
        return reply.send({ success: true });
    });
    // ==========================================
    // PROJECTS
    // ==========================================
    fastify.get('/projects', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { workspace_id, status, search } = request.query;
        const data = await projectService.getProjects(userId, { team_id: workspace_id, status, search });
        return reply.send(data);
    });
    fastify.get('/projects/:id', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const data = await projectService.getProjectById(id, userId);
        return reply.send(data);
    });
    fastify.post('/projects', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const body = request.body;
        const data = await projectService.createProject(userId, body);
        return reply.send(data);
    });
    fastify.put('/projects/:id', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const body = request.body;
        const data = await projectService.updateProject(id, userId, body);
        return reply.send(data);
    });
    fastify.delete('/projects/:id', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        await projectService.deleteProject(id, userId);
        return reply.send({ success: true });
    });
    fastify.post('/projects/:id/archive', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const data = await projectService.archiveProject(id, userId);
        return reply.send(data);
    });
    fastify.get('/projects/:id/members', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const data = await projectService.getProjectMembers(id, userId);
        return reply.send(data);
    });
    fastify.post('/projects/:id/invite', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const invites = request.body;
        const data = await projectService.inviteProjectMembers(id, invites);
        return reply.send(data);
    });
    fastify.delete('/projects/:id/members/:memberId', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id, memberId } = request.params;
        await projectService.removeProjectMember(memberId, userId);
        return reply.send({ success: true });
    });
    fastify.put('/projects/:id/members/:memberId/role', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id, memberId } = request.params;
        const { role } = request.body;
        const data = await projectService.updateProjectMemberRole(memberId, userId, role);
        return reply.send(data);
    });
    fastify.post('/projects/:id/transfer-ownership', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const { memberId } = request.body;
        const data = await projectService.transferProjectOwnership(id, memberId, userId);
        return reply.send(data);
    });
    // ==========================================
    // CHANNELS
    // ==========================================
    fastify.get('/projects/:id/channels', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const data = await channelService.getProjectChannels(id, userId);
        return reply.send(data);
    });
    fastify.post('/projects/:id/channels', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const body = request.body;
        const data = await channelService.createChannel(id, userId, body);
        return reply.send(data);
    });
    fastify.put('/channels/:id', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const body = request.body;
        const data = await channelService.updateChannel(id, userId, body);
        return reply.send(data);
    });
    fastify.delete('/channels/:id', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        await channelService.deleteChannel(id, userId);
        return reply.send({ success: true });
    });
    // ==========================================
    // MESSAGES
    // ==========================================
    fastify.get('/channels/:id/messages', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const { before, after, limit } = request.query;
        const data = await messageService.getChannelMessages(id, userId, {
            before,
            after,
            limit: limit ? parseInt(limit, 10) : 50
        });
        return reply.send(data);
    });
    fastify.post('/channels/:id/messages', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const body = request.body;
        const data = await messageService.createMessage({
            ...body,
            channel_id: id,
            sender_id: userId
        });
        return reply.send(data);
    });
    fastify.put('/messages/:id', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const body = request.body;
        const data = await messageService.updateMessage(id, userId, body);
        return reply.send(data);
    });
    fastify.delete('/messages/:id', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        await messageService.deleteMessage(id, userId);
        return reply.send({ success: true });
    });
    fastify.post('/messages/:id/react', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const { emoji } = request.body;
        const data = await messageService.addMessageReaction({ message_id: id, user_id: userId, emoji });
        return reply.send(data);
    });
    fastify.post('/messages/:id/pin', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const data = await messageService.togglePinMessage(id, userId);
        return reply.send(data);
    });
    fastify.post('/messages/:id/star', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const data = await messageService.toggleStarMessage(id, userId);
        return reply.send(data);
    });
    // ==========================================
    // FILES
    // ==========================================
    fastify.get('/projects/:id/files', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const { folder_id, file_type, search } = request.query;
        const data = await fileService.getProjectFiles(id, userId, { folder_id, file_type, search });
        return reply.send(data);
    });
    fastify.post('/projects/:id/files', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const { name, type, size, base64Data, folderId } = request.body;
        const buffer = Buffer.from(base64Data, 'base64');
        const data = await fileService.uploadFile(id, userId, { name, type, size, buffer }, folderId);
        return reply.send(data);
    });
    fastify.post('/projects/:id/folders', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const { name, folderId } = request.body;
        const data = await fileService.createFolder(id, userId, name, folderId);
        return reply.send(data);
    });
    fastify.delete('/files/:id', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        await fileService.deleteFile(id, userId);
        return reply.send({ success: true });
    });
    // ==========================================
    // MEETINGS
    // ==========================================
    fastify.get('/projects/:id/meetings', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const data = await meetingService.getProjectMeetings(id, userId);
        return reply.send(data);
    });
    fastify.post('/projects/:id/meetings', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const body = request.body;
        const data = await meetingService.createMeeting(id, userId, {
            ...body,
            organizer_id: userId
        });
        return reply.send(data);
    });
    fastify.put('/meetings/:id', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const body = request.body;
        const data = await meetingService.updateMeeting(id, userId, body);
        return reply.send(data);
    });
    fastify.post('/meetings/:id/join', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        const data = await meetingService.joinMeeting(id, userId);
        return reply.send(data);
    });
    // ==========================================
    // TIMELINE & SEARCH
    // ==========================================
    fastify.get('/projects/:id/timeline', async (request, reply) => {
        const userId = await authenticate(request, reply);
        const { id } = request.params;
        // Fetch from activity_feed table
        const { data, error } = await supabase
            .from('activity_feed')
            .select('*')
            .eq('metadata->>project_id', id)
            .order('created_at', { ascending: false });
        if (error) {
            return reply.status(500).send({ error: error.message });
        }
        return reply.send(data || []);
    });
}
//# sourceMappingURL=routes.js.map