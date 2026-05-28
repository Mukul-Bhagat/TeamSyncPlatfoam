"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriggerRegistry = void 0;
const EventTrigger_1 = require("./EventTrigger");
const ScheduleTrigger_1 = require("./ScheduleTrigger");
const ManualTrigger_1 = require("./ManualTrigger");
const AITrigger_1 = require("./AITrigger");
const CommandTrigger_1 = require("./CommandTrigger");
class TriggerRegistry {
    static instance;
    registrations = new Map();
    constructor() { }
    static getInstance() {
        if (!TriggerRegistry.instance) {
            TriggerRegistry.instance = new TriggerRegistry();
        }
        return TriggerRegistry.instance;
    }
    /**
     * Register a trigger for a workflow
     */
    register(workflowId, triggerType, trigger) {
        const registration = {
            workflowId,
            triggerType,
            trigger,
        };
        this.registrations.set(workflowId, registration);
    }
    /**
     * Unregister a trigger
     */
    unregister(workflowId) {
        this.registrations.delete(workflowId);
    }
    /**
     * Get trigger registration for a workflow
     */
    get(workflowId) {
        return this.registrations.get(workflowId);
    }
    /**
     * Get all registrations
     */
    getAll() {
        return Array.from(this.registrations.values());
    }
    /**
     * Get registrations by trigger type
     */
    getByType(triggerType) {
        return Array.from(this.registrations.values()).filter((reg) => reg.triggerType === triggerType);
    }
    /**
     * Create a trigger instance based on type
     */
    createTrigger(triggerType, config) {
        switch (triggerType) {
            case 'event':
                return new EventTrigger_1.EventTrigger(config);
            case 'schedule':
                return new ScheduleTrigger_1.ScheduleTrigger(config);
            case 'manual':
                return new ManualTrigger_1.ManualTrigger(config);
            case 'AI':
                return new AITrigger_1.AITrigger(config);
            case 'command':
                return new CommandTrigger_1.CommandTrigger(config);
            default:
                throw new Error(`Unknown trigger type: ${triggerType}`);
        }
    }
    /**
     * Clear all registrations
     */
    clear() {
        this.registrations.clear();
    }
}
exports.TriggerRegistry = TriggerRegistry;
//# sourceMappingURL=TriggerRegistry.js.map