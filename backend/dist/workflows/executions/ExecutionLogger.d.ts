export interface ExecutionLogEntry {
    execution_id: string;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    step_id?: string;
    metadata?: Record<string, unknown>;
    timestamp: string;
}
export declare class ExecutionLogger {
    private static instance;
    private supabase;
    private constructor();
    static getInstance(): ExecutionLogger;
    /**
     * Log an execution event
     */
    log(entry: ExecutionLogEntry): Promise<void>;
    /**
     * Log info
     */
    logInfo(executionId: string, message: string, stepId?: string, metadata?: Record<string, unknown>): Promise<void>;
    /**
     * Log warning
     */
    logWarn(executionId: string, message: string, stepId?: string, metadata?: Record<string, unknown>): Promise<void>;
    /**
     * Log error
     */
    logError(executionId: string, message: string, stepId?: string, metadata?: Record<string, unknown>): Promise<void>;
    /**
     * Log debug
     */
    logDebug(executionId: string, message: string, stepId?: string, metadata?: Record<string, unknown>): Promise<void>;
    /**
     * Get execution logs
     */
    getLogs(executionId: string): Promise<ExecutionLogEntry[]>;
}
//# sourceMappingURL=ExecutionLogger.d.ts.map