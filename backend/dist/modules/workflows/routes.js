"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowRoutes = workflowRoutes;
const service_1 = require("./service");
async function workflowRoutes(fastify) {
    const service = new service_1.WorkflowService();
    // Workflow CRUD
    fastify.post('/workflows', async (request, reply) => {
        const body = request.body;
        const userId = request.user?.id;
        try {
            const workflow = await service.createWorkflow(body, userId);
            return reply.send(workflow);
        }
        catch (error) {
            return reply.status(500).send({ error: error instanceof Error ? error.message : String(error) });
        }
    });
    fastify.get('/workflows/:id', async (request, reply) => {
        const { id } = request.params;
        try {
            const workflow = await service.getWorkflow(id);
            return reply.send(workflow);
        }
        catch (error) {
            return reply.status(404).send({ error: 'Workflow not found' });
        }
    });
    fastify.get('/workflows', async (request, reply) => {
        const query = request.query;
        try {
            const workflows = await service.getWorkflows(query.organization_id);
            return reply.send(workflows);
        }
        catch (error) {
            return reply.status(500).send({ error: error instanceof Error ? error.message : String(error) });
        }
    });
    fastify.put('/workflows/:id', async (request, reply) => {
        const { id } = request.params;
        const body = request.body;
        try {
            const workflow = await service.updateWorkflow(id, body);
            return reply.send(workflow);
        }
        catch (error) {
            return reply.status(500).send({ error: error instanceof Error ? error.message : String(error) });
        }
    });
    fastify.delete('/workflows/:id', async (request, reply) => {
        const { id } = request.params;
        try {
            await service.deleteWorkflow(id);
            return reply.send({ success: true });
        }
        catch (error) {
            return reply.status(500).send({ error: error instanceof Error ? error.message : String(error) });
        }
    });
    // Execution operations
    fastify.post('/workflows/:id/execute', async (request, reply) => {
        const { id } = request.params;
        const body = request.body;
        try {
            const executionId = await service.executeWorkflow(id, body.context || {});
            return reply.send({ execution_id: executionId });
        }
        catch (error) {
            return reply.status(500).send({ error: error instanceof Error ? error.message : String(error) });
        }
    });
    fastify.get('/executions/:id', async (request, reply) => {
        const { id } = request.params;
        try {
            const execution = await service.getExecution(id);
            return reply.send(execution);
        }
        catch (error) {
            return reply.status(404).send({ error: 'Execution not found' });
        }
    });
    fastify.get('/workflows/:id/executions', async (request, reply) => {
        const { id } = request.params;
        const query = request.query;
        const limit = query.limit ? parseInt(query.limit) : 50;
        try {
            const executions = await service.getExecutions(id, limit);
            return reply.send(executions);
        }
        catch (error) {
            return reply.status(500).send({ error: error instanceof Error ? error.message : String(error) });
        }
    });
    fastify.post('/executions/:id/cancel', async (request, reply) => {
        const { id } = request.params;
        try {
            const success = await service.cancelExecution(id);
            return reply.send({ success });
        }
        catch (error) {
            return reply.status(500).send({ error: error instanceof Error ? error.message : String(error) });
        }
    });
    // Trigger operations
    fastify.post('/workflows/:id/triggers', async (request, reply) => {
        const { id } = request.params;
        const body = request.body;
        try {
            await service.registerTrigger(id, body.trigger_type, body.trigger_config);
            return reply.send({ success: true });
        }
        catch (error) {
            return reply.status(500).send({ error: error instanceof Error ? error.message : String(error) });
        }
    });
    // Capability operations
    fastify.post('/capabilities/grant', async (request, reply) => {
        const body = request.body;
        const userId = request.user?.id;
        try {
            const success = await service.grantCapability(body.user_id, body.capability_name, userId);
            return reply.send({ success });
        }
        catch (error) {
            return reply.status(500).send({ error: error instanceof Error ? error.message : String(error) });
        }
    });
    fastify.post('/capabilities/revoke', async (request, reply) => {
        const body = request.body;
        try {
            const success = await service.revokeCapability(body.user_id, body.capability_name);
            return reply.send({ success });
        }
        catch (error) {
            return reply.status(500).send({ error: error instanceof Error ? error.message : String(error) });
        }
    });
    fastify.get('/capabilities/:userId', async (request, reply) => {
        const { userId } = request.params;
        try {
            const capabilities = await service.getUserCapabilities(userId);
            return reply.send({ capabilities });
        }
        catch (error) {
            return reply.status(500).send({ error: error instanceof Error ? error.message : String(error) });
        }
    });
    // Command operations
    fastify.post('/commands/execute', async (request, reply) => {
        const body = request.body;
        const userId = request.user?.id;
        const organizationId = request.user?.organization_id;
        try {
            const result = await service.executeCommand(body.command_name, body.args, userId, organizationId);
            return reply.send(result);
        }
        catch (error) {
            return reply.status(500).send({ error: error instanceof Error ? error.message : String(error) });
        }
    });
    fastify.get('/commands', async (request, reply) => {
        const userId = request.user?.id;
        try {
            const commands = await service.getAvailableCommands(userId);
            return reply.send({ commands });
        }
        catch (error) {
            return reply.status(500).send({ error: error instanceof Error ? error.message : String(error) });
        }
    });
}
//# sourceMappingURL=routes.js.map