"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicActionRegistry = void 0;
const ActionRegistry_1 = require("./ActionRegistry");
class DynamicActionRegistry {
    static instance;
    actionRegistry;
    constructor() {
        this.actionRegistry = ActionRegistry_1.ActionRegistry.getInstance();
    }
    static getInstance() {
        if (!DynamicActionRegistry.instance) {
            DynamicActionRegistry.instance = new DynamicActionRegistry();
        }
        return DynamicActionRegistry.instance;
    }
    /**
     * Register a dynamic action from an ecosystem app
     */
    registerDynamicAction(actionType, action, sourceApp) {
        this.actionRegistry.registerDynamicAction(actionType, action);
        console.log(`[DynamicActionRegistry] Registered action ${actionType} from ${sourceApp}`);
    }
    /**
     * Unregister a dynamic action
     */
    unregisterDynamicAction(actionType, sourceApp) {
        this.actionRegistry.unregister(actionType);
        console.log(`[DynamicActionRegistry] Unregistered action ${actionType} from ${sourceApp}`);
    }
    /**
     * Get all dynamic actions
     */
    getDynamicActions() {
        return this.actionRegistry.getDynamicActions();
    }
    /**
     * Clear all dynamic actions (e.g., on app uninstall)
     */
    clearDynamicActions(sourceApp) {
        const dynamicActions = this.actionRegistry.getDynamicActions();
        dynamicActions.forEach((action, actionType) => {
            this.actionRegistry.unregister(actionType);
        });
        console.log(`[DynamicActionRegistry] Cleared all dynamic actions from ${sourceApp}`);
    }
}
exports.DynamicActionRegistry = DynamicActionRegistry;
//# sourceMappingURL=DynamicActionRegistry.js.map