"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionRecovery = void 0;
const ExecutionManager_1 = require("./ExecutionManager");
const WorkflowStateTracker_1 = require("../engine/WorkflowStateTracker");
const WorkflowLogger_1 = require("../engine/WorkflowLogger");
class ExecutionRecovery {
    static instance;
    executionManager;
    stateTracker;
    logger;
    constructor() {
        this.executionManager = ExecutionManager_1.ExecutionManager.getInstance();
        this.stateTracker = new WorkflowStateTracker_1.WorkflowStateTracker();
        this.logger = new WorkflowLogger_1.WorkflowLogger();
    }
    static getInstance() {
        if (!ExecutionRecovery.instance) {
            ExecutionRecovery.instance = new ExecutionRecovery();
        }
        return ExecutionRecovery.instance;
    }
    /**
     * Recover failed executions
     */
    async recoverFailedExecutions(olderThanMinutes = 5) {
        const failedExecutions = await this.stateTracker.getFailedExecutions(olderThanMinutes);
        let recovered = 0;
        for (const execution of failedExecutions) {
            try {
                await this.executionManager.retryExecution(execution.id);
                recovered++;
            }
            catch (error) {
                console.error(`Failed to recover execution ${execution.id}:`, error);
            }
        }
        return recovered;
    }
    /**
     * Recover stuck executions (pending for too long)
     */
    async recoverStuckExecutions(stuckThresholdMinutes = 30) {
        const pendingExecutions = await this.stateTracker.getPendingExecutions();
        const cutoffTime = new Date(Date.now() - stuckThresholdMinutes * 60 * 1000);
        let recovered = 0;
        for (const execution of pendingExecutions) {
            const createdAt = new Date(execution.created_at);
            if (createdAt < cutoffTime) {
                try {
                    // Mark as failed and retry
                    await this.stateTracker.failExecution(execution.id, 'Execution stuck - timeout');
                    await this.executionManager.retryExecution(execution.id);
                    recovered++;
                }
                catch (error) {
                    console.error(`Failed to recover stuck execution ${execution.id}:`, error);
                }
            }
        }
        return recovered;
    }
    /**
     * Run recovery process
     */
    async runRecovery() {
        const failedRecovered = await this.recoverFailedExecutions();
        const stuckRecovered = await this.recoverStuckExecutions();
        return {
            failedRecovered,
            stuckRecovered,
        };
    }
}
exports.ExecutionRecovery = ExecutionRecovery;
//# sourceMappingURL=ExecutionRecovery.js.map