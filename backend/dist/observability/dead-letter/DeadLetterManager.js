"use strict";
/**
 * DeadLetterManager - Manages dead letter events with layered persistence
 *
 * Extends the EventBus dead letter log with database persistence.
 * Layered approach:
 * - In-memory cache for recent failures (fast debugging)
 * - Database table for persistence (replay, auditing, analysis)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeadLetterManager = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../../config/env");
class DeadLetterManager {
    static instance;
    supabase;
    inMemoryCache = [];
    CACHE_SIZE = 500;
    constructor() {
        this.supabase = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_ROLE_KEY);
    }
    static getInstance() {
        if (!DeadLetterManager.instance) {
            DeadLetterManager.instance = new DeadLetterManager();
        }
        return DeadLetterManager.instance;
    }
    /**
     * Add a dead letter event
     */
    async addDeadLetter(sourceSystem, event, errorMessage, organizationId, workspaceId) {
        // Add to in-memory cache
        this.inMemoryCache.push({
            event,
            error: errorMessage,
            timestamp: new Date().toISOString(),
        });
        // Keep cache size limited
        if (this.inMemoryCache.length > this.CACHE_SIZE) {
            this.inMemoryCache.shift();
        }
        // Persist to database
        try {
            await this.supabase.from('dead_letter_events').insert({
                source_system: sourceSystem,
                event_type: event.event_type,
                payload: event.payload,
                error_message: errorMessage,
                retry_count: 0,
                organization_id: organizationId,
                workspace_id: workspaceId,
                metadata: {
                    source_app: event.source_app,
                    event_version: event.event_version,
                    severity: event.severity,
                    correlation_id: event.correlation_id,
                },
            });
        }
        catch (error) {
            // Log but don't throw - dead letter failures shouldn't crash the system
            // In production, you'd want proper logging here
        }
    }
    /**
     * Get recent dead letter events from cache
     */
    getRecentDeadLetters(limit = 50) {
        return this.inMemoryCache.slice(-limit);
    }
    /**
     * Get dead letter events from database
     */
    async getDeadLetterEvents(options = {}) {
        let query = this.supabase
            .from('dead_letter_events')
            .select('*')
            .order('failed_at', { ascending: false });
        if (options.sourceSystem) {
            query = query.eq('source_system', options.sourceSystem);
        }
        if (options.eventType) {
            query = query.eq('event_type', options.eventType);
        }
        if (options.organizationId) {
            query = query.eq('organization_id', options.organizationId);
        }
        if (options.workspaceId) {
            query = query.eq('workspace_id', options.workspaceId);
        }
        if (options.limit) {
            query = query.limit(options.limit);
        }
        if (options.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
        }
        const { data, error } = await query;
        if (error) {
            throw new Error(`Failed to fetch dead letter events: ${error.message}`);
        }
        return (data || []).map((row) => ({
            id: row.id,
            sourceSystem: row.source_system,
            eventType: row.event_type,
            payload: row.payload,
            errorMessage: row.error_message,
            retryCount: row.retry_count,
            failedAt: new Date(row.failed_at),
            replayedAt: row.replayed_at ? new Date(row.replayed_at) : undefined,
            organizationId: row.organization_id,
            workspaceId: row.workspace_id,
            metadata: row.metadata,
        }));
    }
    /**
     * Get dead letter event by ID
     */
    async getDeadLetterEvent(id) {
        const { data, error } = await this.supabase
            .from('dead_letter_events')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                return null; // Not found
            }
            throw new Error(`Failed to fetch dead letter event: ${error.message}`);
        }
        return {
            id: data.id,
            sourceSystem: data.source_system,
            eventType: data.event_type,
            payload: data.payload,
            errorMessage: data.error_message,
            retryCount: data.retry_count,
            failedAt: new Date(data.failed_at),
            replayedAt: data.replayed_at ? new Date(data.replayed_at) : undefined,
            organizationId: data.organization_id,
            workspaceId: data.workspace_id,
            metadata: data.metadata,
        };
    }
    /**
     * Mark a dead letter event as replayed
     */
    async markAsReplayed(id) {
        const { error } = await this.supabase
            .from('dead_letter_events')
            .update({
            replayed_at: new Date().toISOString(),
        })
            .eq('id', id);
        if (error) {
            throw new Error(`Failed to mark dead letter as replayed: ${error.message}`);
        }
    }
    /**
     * Increment retry count for a dead letter event
     */
    async incrementRetryCount(id) {
        const { error } = await this.supabase.rpc('increment_dead_letter_retry', {
            event_id: id,
        });
        if (error) {
            // Fallback to manual update if RPC doesn't exist
            const event = await this.getDeadLetterEvent(id);
            if (event) {
                await this.supabase
                    .from('dead_letter_events')
                    .update({ retry_count: event.retryCount + 1 })
                    .eq('id', id);
            }
        }
    }
    /**
     * Delete old dead letter events
     */
    async cleanup(retentionDays = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        const { error } = await this.supabase
            .from('dead_letter_events')
            .delete()
            .lt('failed_at', cutoffDate.toISOString());
        if (error) {
            throw new Error(`Failed to cleanup dead letter events: ${error.message}`);
        }
        return 0; // Supabase doesn't return count on delete
    }
    /**
     * Get dead letter statistics
     */
    async getStatistics(options = {}) {
        let query = this.supabase
            .from('dead_letter_events')
            .select('source_system, event_type, replayed_at');
        if (options.organizationId) {
            query = query.eq('organization_id', options.organizationId);
        }
        if (options.workspaceId) {
            query = query.eq('workspace_id', options.workspaceId);
        }
        if (options.timeRange) {
            query = query.gte('failed_at', options.timeRange.start.toISOString()).lte('failed_at', options.timeRange.end.toISOString());
        }
        const { data, error } = await query;
        if (error) {
            throw new Error(`Failed to fetch dead letter statistics: ${error.message}`);
        }
        const events = data || [];
        const bySourceSystem = {};
        const byEventType = {};
        let replayed = 0;
        let pending = 0;
        for (const event of events) {
            bySourceSystem[event.source_system] = (bySourceSystem[event.source_system] || 0) + 1;
            byEventType[event.event_type] = (byEventType[event.event_type] || 0) + 1;
            if (event.replayed_at) {
                replayed++;
            }
            else {
                pending++;
            }
        }
        return {
            total: events.length,
            bySourceSystem,
            byEventType,
            replayed,
            pending,
        };
    }
    /**
     * Clear in-memory cache
     */
    clearCache() {
        this.inMemoryCache = [];
    }
}
exports.DeadLetterManager = DeadLetterManager;
//# sourceMappingURL=DeadLetterManager.js.map