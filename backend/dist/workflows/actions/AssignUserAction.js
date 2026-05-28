"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignUserAction = void 0;
class AssignUserAction {
    async execute(config, context) {
        const cfg = config;
        try {
            // TODO: Integrate with assignment system
            // For now, just log the assignment
            console.log(`[AssignUserAction] Assigning user ${cfg.user_id} to ${cfg.entity_type} ${cfg.entity_id}`);
            return {
                success: true,
                data: {
                    assignment_id: crypto.randomUUID(),
                    user_id: cfg.user_id,
                    entity_type: cfg.entity_type,
                    entity_id: cfg.entity_id,
                    assigned_at: new Date().toISOString(),
                },
                metadata: {
                    role: cfg.role,
                    notification: cfg.notification,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    validate(config) {
        const cfg = config;
        return !!(cfg.user_id && cfg.entity_type && cfg.entity_id);
    }
    getSchema() {
        return {
            type: 'assign_user',
            description: 'Assign a user to an entity',
            config_schema: {
                user_id: { type: 'string', required: true, description: 'User ID to assign' },
                entity_type: { type: 'enum', required: true, values: ['incident', 'task', 'deployment'] },
                entity_id: { type: 'string', required: true, description: 'Entity ID' },
                role: { type: 'string', required: false, description: 'Assignment role' },
                notification: { type: 'boolean', required: false, default: true },
            },
        };
    }
}
exports.AssignUserAction = AssignUserAction;
//# sourceMappingURL=AssignUserAction.js.map