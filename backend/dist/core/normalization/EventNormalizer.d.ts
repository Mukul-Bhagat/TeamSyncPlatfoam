export interface NormalizedEvent {
    source_app: string;
    organization_id: string;
    workspace_id?: string;
    channel_id?: string;
    event_type: string;
    event_version: string;
    payload: Record<string, unknown>;
    metadata: Record<string, unknown>;
    severity: 'info' | 'warning' | 'critical';
    correlation_id?: string;
    triggered_by?: string;
}
export interface RawEvent {
    event_type: string;
    event_version?: string;
    timestamp?: string;
    data?: Record<string, unknown>;
    payload?: Record<string, unknown>;
    [key: string]: unknown;
}
type NormalizerFn = (raw: RawEvent, defaults: Partial<NormalizedEvent>) => NormalizedEvent;
export declare class EventNormalizer {
    static normalize(raw: RawEvent, defaults?: Partial<NormalizedEvent>): NormalizedEvent;
    static registerNormalizer(sourceApp: string, normalizer: NormalizerFn): void;
}
export {};
//# sourceMappingURL=EventNormalizer.d.ts.map