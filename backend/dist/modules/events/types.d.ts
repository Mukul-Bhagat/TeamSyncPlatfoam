import type { EcosystemEvent } from '../../types';
import type { CreateEventBody, QueryEventsInput } from '../../core/validation/event-schemas';
export type CreateEventRequest = CreateEventBody;
export type QueryEventsRequest = QueryEventsInput;
export interface EventStats {
    total_events: number;
    by_source_app: Record<string, number>;
    by_event_type: Record<string, number>;
    by_severity: Record<string, number>;
    recent_critical: EcosystemEvent[];
}
export interface EventStreamOptions {
    organization_id?: string;
    workspace_id?: string;
    event_types?: string[];
    severity?: string[];
}
//# sourceMappingURL=types.d.ts.map