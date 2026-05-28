"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionRegistry = void 0;
class ActionRegistry {
    static instance;
    coreActions = new Map();
    dynamicActions = new Map();
    constructor() { }
    static getInstance() {
        if (!ActionRegistry.instance) {
            ActionRegistry.instance = new ActionRegistry();
        }
        return ActionRegistry.instance;
    }
    /**
     * Register a core action (built-in)
     */
    registerCoreAction(actionType, action) {
        this.coreActions.set(actionType, action);
    }
    /**
     * Register a dynamic action (from ecosystem apps)
     */
    registerDynamicAction(actionType, action) {
        this.dynamicActions.set(actionType, action);
    }
    /**
     * Unregister an action
     */
    unregister(actionType) {
        this.coreActions.delete(actionType);
        this.dynamicActions.delete(actionType);
    }
    /**
     * Get an action (core takes precedence)
     */
    get(actionType) {
        return this.coreActions.get(actionType) || this.dynamicActions.get(actionType);
    }
    /**
     * Get all core actions
     */
    getCoreActions() {
        return new Map(this.coreActions);
    }
    /**
     * Get all dynamic actions
     */
    getDynamicActions() {
        return new Map(this.dynamicActions);
    }
    /**
     * Get all actions
     */
    getAllActions() {
        const all = new Map(this.coreActions);
        this.dynamicActions.forEach((action, type) => {
            all.set(type, action);
        });
        return all;
    }
    /**
     * Check if action type exists
     */
    has(actionType) {
        return this.coreActions.has(actionType) || this.dynamicActions.has(actionType);
    }
    /**
     * Clear all actions
     */
    clear() {
        this.coreActions.clear();
        this.dynamicActions.clear();
    }
}
exports.ActionRegistry = ActionRegistry;
//# sourceMappingURL=ActionRegistry.js.map