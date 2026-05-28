"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentAction = void 0;
class IncidentAction {
    async execute(config, _context) {
        const cfg = config;
        try {
            // TODO: Integrate with incident system
            // For now, just log the incident creation
            console.log(`[IncidentAction] Creating incident: ${cfg.title} (${cfg.severity})`);
            return {
                success: true,
                data: {
                    incident_id: crypto.randomUUID(),
                    title: cfg.title,
                    severity: cfg.severity,
                    created_at: new Date().toISOString(),
                },
                metadata: {
                    assignee_id: cfg.assignee_id,
                    workspace_id: cfg.workspace_id,
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
        return !!(cfg.title && cfg.severity);
    }
    getSchema() {
        return {
            type: 'create_incident',
            description: 'Create a new incident',
            config_schema: {
                title: { type: 'string', required: true, description: 'Incident title' },
                description: { type: 'string', required: false, description: 'Incident description' },
                severity: { type: 'enum', required: true, values: ['info', 'low', 'medium', 'high', 'critical'] },
                assignee_id: { type: 'string', required: false, description: 'User ID to assign' },
                workspace_id: { type: 'string', required: false, description: 'Workspace ID' },
            },
        };
    }
}
exports.IncidentAction = IncidentAction;
//# sourceMappingURL=IncidentAction.js.map