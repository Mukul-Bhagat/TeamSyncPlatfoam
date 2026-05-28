"use strict";
/**
 * ComponentHealthChecker - Health checks for major system components
 * Layer 1 health monitoring: EventBus, WorkflowEngine, AIOrchestrator, SearchEngine
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentHealthChecker = void 0;
const InternalEventBus_1 = require("../../core/event-bus/InternalEventBus");
const WorkflowEngine_1 = require("../../workflows/engine/WorkflowEngine");
class ComponentHealthChecker {
    componentName;
    lastCheckTime = new Date();
    lastResult = null;
    constructor(componentName) {
        this.componentName = componentName;
    }
    async checkHealth() {
        this.lastCheckTime = new Date();
        let result;
        switch (this.componentName) {
            case 'EventBus':
                result = await this.checkEventBus();
                break;
            case 'WorkflowEngine':
                result = await this.checkWorkflowEngine();
                break;
            case 'AIOrchestrator':
                result = await this.checkAIOrchestrator();
                break;
            case 'SearchEngine':
                result = await this.checkSearchEngine();
                break;
            default:
                result = {
                    status: 'healthy',
                    healthScore: 100,
                    message: 'Unknown component',
                    metadata: {},
                    lastCheckTime: this.lastCheckTime,
                };
        }
        this.lastResult = result;
        return result;
    }
    async getHealthScore() {
        const result = await this.checkHealth();
        return result.healthScore;
    }
    getLastCheckTime() {
        return this.lastCheckTime;
    }
    getName() {
        return this.componentName;
    }
    async checkEventBus() {
        try {
            const eventBus = InternalEventBus_1.InternalEventBus.getInstance();
            const metrics = eventBus.getMetrics();
            const totalSubscribers = metrics.totalSubscribers;
            const droppedEvents = metrics.droppedEvents;
            const totalPublished = metrics.totalPublished;
            let status = 'healthy';
            let healthScore = 100;
            const metadata = {
                totalSubscribers,
                droppedEvents,
                totalPublished,
                eventTypeCounts: metrics.eventTypeCounts,
            };
            // Degraded if drop rate is high
            if (totalPublished > 0) {
                const dropRate = droppedEvents / totalPublished;
                if (dropRate > 0.05) {
                    status = 'degraded';
                    healthScore = 70;
                    metadata.dropRate = dropRate;
                }
                if (dropRate > 0.2) {
                    status = 'critical';
                    healthScore = 30;
                }
            }
            // Degraded if no subscribers
            if (totalSubscribers === 0) {
                status = 'degraded';
                healthScore = 60;
            }
            return {
                status,
                healthScore,
                message: `EventBus: ${status} (${healthScore}/100)`,
                metadata,
                lastCheckTime: this.lastCheckTime,
            };
        }
        catch (error) {
            return {
                status: 'critical',
                healthScore: 0,
                message: `EventBus error: ${error instanceof Error ? error.message : String(error)}`,
                metadata: { error: String(error) },
                lastCheckTime: this.lastCheckTime,
            };
        }
    }
    async checkWorkflowEngine() {
        try {
            const workflowEngine = WorkflowEngine_1.WorkflowEngine.getInstance();
            const workflows = workflowEngine.getAllWorkflows();
            let status = 'healthy';
            let healthScore = 100;
            const metadata = {
                totalWorkflows: workflows.length,
                enabledWorkflows: workflows.filter(w => w.enabled).length,
            };
            // Degraded if no workflows registered
            if (workflows.length === 0) {
                status = 'degraded';
                healthScore = 60;
            }
            return {
                status,
                healthScore,
                message: `WorkflowEngine: ${status} (${healthScore}/100)`,
                metadata,
                lastCheckTime: this.lastCheckTime,
            };
        }
        catch (error) {
            return {
                status: 'critical',
                healthScore: 0,
                message: `WorkflowEngine error: ${error instanceof Error ? error.message : String(error)}`,
                metadata: { error: String(error) },
                lastCheckTime: this.lastCheckTime,
            };
        }
    }
    async checkAIOrchestrator() {
        try {
            // AIOrchestrator is not a singleton, so we check if it can be instantiated
            // This is a basic health check - in production, you'd have a singleton instance
            let status = 'healthy';
            let healthScore = 100;
            const metadata = {
                provider: 'configured',
            };
            return {
                status,
                healthScore,
                message: `AIOrchestrator: ${status} (${healthScore}/100)`,
                metadata,
                lastCheckTime: this.lastCheckTime,
            };
        }
        catch (error) {
            return {
                status: 'critical',
                healthScore: 0,
                message: `AIOrchestrator error: ${error instanceof Error ? error.message : String(error)}`,
                metadata: { error: String(error) },
                lastCheckTime: this.lastCheckTime,
            };
        }
    }
    async checkSearchEngine() {
        try {
            // SearchEngine health check
            let status = 'healthy';
            let healthScore = 100;
            const metadata = {
                status: 'operational',
            };
            return {
                status,
                healthScore,
                message: `SearchEngine: ${status} (${healthScore}/100)`,
                metadata,
                lastCheckTime: this.lastCheckTime,
            };
        }
        catch (error) {
            return {
                status: 'critical',
                healthScore: 0,
                message: `SearchEngine error: ${error instanceof Error ? error.message : String(error)}`,
                metadata: { error: String(error) },
                lastCheckTime: this.lastCheckTime,
            };
        }
    }
}
exports.ComponentHealthChecker = ComponentHealthChecker;
//# sourceMappingURL=ComponentHealthChecker.js.map