export interface MemoryCandidate {
    memoryType: 'important_incident' | 'deployment_pattern' | 'operational_decision' | 'recurring_issue' | 'ai_generated_memory';
    sourceEntityType: string;
    sourceEntityId: string;
    title: string;
    content: string;
    importanceScore: number;
    metadata: Record<string, unknown>;
}
export declare class MemoryDetector {
    /**
     * Detect deployment patterns (repeated failures)
     */
    detectDeploymentPattern(deploymentId: string, organizationId: string): Promise<MemoryCandidate | null>;
    /**
     * Detect important incidents (critical severity)
     */
    detectImportantIncident(incidentId: string, organizationId: string): Promise<MemoryCandidate | null>;
    /**
     * Detect recurring issues (same incident pattern)
     */
    detectRecurringIssue(incidentId: string, organizationId: string): Promise<MemoryCandidate | null>;
    /**
     * Create memory from high-severity AI insight
     */
    detectAIMemory(insightId: string, organizationId: string): Promise<MemoryCandidate | null>;
    /**
     * Run all detection rules for an entity
     */
    detectMemories(entityType: string, entityId: string, organizationId: string): Promise<MemoryCandidate[]>;
}
//# sourceMappingURL=MemoryDetector.d.ts.map