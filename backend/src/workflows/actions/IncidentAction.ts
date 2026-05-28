import type { IWorkflowAction, ActionResult, ActionSchema } from './IWorkflowAction';

export interface IncidentConfig {
  title: string;
  description?: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  assignee_id?: string;
  workspace_id?: string;
  metadata?: Record<string, unknown>;
}

export class IncidentAction implements IWorkflowAction {
  async execute(config: Record<string, unknown>, _context: Record<string, unknown>): Promise<ActionResult> {
    const cfg = config as unknown as IncidentConfig;

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
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  validate(config: Record<string, unknown>): boolean {
    const cfg = config as unknown as IncidentConfig;
    return !!(cfg.title && cfg.severity);
  }

  getSchema(): ActionSchema {
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
