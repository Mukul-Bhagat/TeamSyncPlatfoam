"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriggerEngine = void 0;
const InternalEventBus_1 = require("../../core/event-bus/InternalEventBus");
const TriggerRegistry_1 = require("./TriggerRegistry");
const WorkflowLogger_1 = require("../engine/WorkflowLogger");
const WorkflowEngine_1 = require("../engine/WorkflowEngine");
class TriggerEngine {
    static instance;
    eventBus;
    triggerRegistry;
    logger;
    _workflowEngine = null;
    constructor() {
        this.eventBus = InternalEventBus_1.InternalEventBus.getInstance();
        this.triggerRegistry = TriggerRegistry_1.TriggerRegistry.getInstance();
        this.logger = new WorkflowLogger_1.WorkflowLogger();
    }
    get workflowEngine() {
        if (!this._workflowEngine) {
            this._workflowEngine = WorkflowEngine_1.WorkflowEngine.getInstance();
        }
        return this._workflowEngine;
    }
    static getInstance() {
        if (!TriggerEngine.instance) {
            TriggerEngine.instance = new TriggerEngine();
        }
        return TriggerEngine.instance;
    }
    /**
     * Register a trigger for a workflow
     */
    async registerTrigger(workflowId, triggerType, config) {
        const trigger = this.triggerRegistry.createTrigger(triggerType, config);
        this.triggerRegistry.register(workflowId, triggerType, trigger);
        // Subscribe to event bus for event triggers
        if (triggerType === 'event') {
            this.eventBus.subscribe(config.event_type, async (event) => {
                await this.handleEventTrigger(workflowId, event);
            });
        }
        this.logger.logTriggerMatched(workflowId, triggerType, config);
    }
    /**
     * Unregister a trigger
     */
    async unregisterTrigger(workflowId) {
        this.triggerRegistry.unregister(workflowId);
        this.logger.logWorkflowUnregistered(workflowId);
    }
    /**
     * Handle event trigger
     */
    async handleEventTrigger(workflowId, event) {
        const registration = this.triggerRegistry.get(workflowId);
        if (!registration) {
            return;
        }
        const result = await registration.trigger.match(event);
        this.logger.logTriggerEvaluation(workflowId, result.matched);
        if (result.matched) {
            try {
                await this.workflowEngine.executeWorkflow(workflowId, event.id, result.context);
            }
            catch (error) {
                console.error(`Failed to execute workflow ${workflowId} on event trigger:`, error);
            }
        }
    }
    /**
     * Handle manual trigger
     */
    async handleManualTrigger(workflowId, context) {
        const registration = this.triggerRegistry.get(workflowId);
        if (!registration) {
            throw new Error(`No trigger registered for workflow: ${workflowId}`);
        }
        const result = await registration.trigger.match(undefined, context);
        this.logger.logTriggerEvaluation(workflowId, result.matched);
        if (result.matched) {
            try {
                await this.workflowEngine.executeWorkflow(workflowId, undefined, result.context);
            }
            catch (error) {
                console.error(`Failed to execute workflow ${workflowId} on manual trigger:`, error);
                throw error;
            }
        }
    }
    /**
     * Handle AI trigger
     */
    async handleAITrigger(workflowId, context) {
        const registration = this.triggerRegistry.get(workflowId);
        if (!registration) {
            throw new Error(`No trigger registered for workflow: ${workflowId}`);
        }
        const result = await registration.trigger.match(undefined, context);
        this.logger.logTriggerEvaluation(workflowId, result.matched);
        if (result.matched) {
            try {
                await this.workflowEngine.executeWorkflow(workflowId, undefined, result.context);
            }
            catch (error) {
                console.error(`Failed to execute workflow ${workflowId} on AI trigger:`, error);
                throw error;
            }
        }
    }
    /**
     * Handle command trigger
     */
    async handleCommandTrigger(workflowId, context) {
        const registration = this.triggerRegistry.get(workflowId);
        if (!registration) {
            throw new Error(`No trigger registered for workflow: ${workflowId}`);
        }
        const result = await registration.trigger.match(undefined, context);
        this.logger.logTriggerEvaluation(workflowId, result.matched);
        if (result.matched) {
            try {
                await this.workflowEngine.executeWorkflow(workflowId, undefined, result.context);
            }
            catch (error) {
                console.error(`Failed to execute workflow ${workflowId} on command trigger:`, error);
                throw error;
            }
        }
    }
    /**
     * Evaluate all triggers for a given event
     */
    async evaluateEventTriggers(event) {
        const matchedWorkflows = [];
        const eventTriggers = this.triggerRegistry.getByType('event');
        for (const registration of eventTriggers) {
            const result = await registration.trigger.match(event);
            if (result.matched) {
                matchedWorkflows.push(registration.workflowId);
            }
        }
        return matchedWorkflows;
    }
    /**
     * Get all registered triggers
     */
    getAllTriggers() {
        const triggers = new Map();
        const registrations = this.triggerRegistry.getAll();
        for (const registration of registrations) {
            triggers.set(registration.workflowId, {
                type: registration.triggerType,
                metadata: registration.trigger.getMetadata(),
            });
        }
        return triggers;
    }
}
exports.TriggerEngine = TriggerEngine;
//# sourceMappingURL=TriggerEngine.js.map