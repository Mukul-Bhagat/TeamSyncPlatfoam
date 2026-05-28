"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapabilityManager = void 0;
const CapabilityRegistry_1 = require("./CapabilityRegistry");
const CapabilityChecker_1 = require("./CapabilityChecker");
const CapabilityGranter_1 = require("./CapabilityGranter");
class CapabilityManager {
    static instance;
    registry;
    checker;
    granter;
    constructor() {
        this.registry = CapabilityRegistry_1.CapabilityRegistry.getInstance();
        this.checker = CapabilityChecker_1.CapabilityChecker.getInstance();
        this.granter = CapabilityGranter_1.CapabilityGranter.getInstance();
    }
    static getInstance() {
        if (!CapabilityManager.instance) {
            CapabilityManager.instance = new CapabilityManager();
        }
        return CapabilityManager.instance;
    }
    /**
     * Get the capability registry
     */
    getRegistry() {
        return this.registry;
    }
    /**
     * Get the capability checker
     */
    getChecker() {
        return this.checker;
    }
    /**
     * Get the capability granter
     */
    getGranter() {
        return this.granter;
    }
    /**
     * Initialize the capability system
     */
    async initialize() {
        // Core capabilities are already registered in CapabilityRegistry constructor
        console.log('[CapabilityManager] Capability system initialized');
    }
    /**
     * Get all available capabilities
     */
    getAvailableCapabilities() {
        return this.registry.getAllCapabilities();
    }
    /**
     * Get capabilities by category
     */
    getCapabilitiesByCategory(category) {
        return this.registry.getCapabilitiesByCategory(category);
    }
}
exports.CapabilityManager = CapabilityManager;
//# sourceMappingURL=CapabilityManager.js.map