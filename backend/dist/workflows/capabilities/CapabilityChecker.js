"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapabilityChecker = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../../config/env");
const CapabilityRegistry_1 = require("./CapabilityRegistry");
class CapabilityChecker {
    static instance;
    supabase;
    capabilityRegistry;
    constructor() {
        this.supabase = (0, supabase_js_1.createClient)(env_1.env.SUPABASE_URL, env_1.env.SUPABASE_SERVICE_ROLE_KEY);
        this.capabilityRegistry = CapabilityRegistry_1.CapabilityRegistry.getInstance();
    }
    static getInstance() {
        if (!CapabilityChecker.instance) {
            CapabilityChecker.instance = new CapabilityChecker();
        }
        return CapabilityChecker.instance;
    }
    /**
     * Check if a user has a specific capability
     */
    async checkCapability(userId, capabilityName) {
        // Check if capability exists
        if (!this.capabilityRegistry.hasCapability(capabilityName)) {
            return false;
        }
        // Check if user has the capability directly
        const { data, error } = await this.supabase
            .from('user_capabilities')
            .select('*')
            .eq('user_id', userId)
            .eq('capability_name', capabilityName)
            .single();
        if (error && error.code !== 'PGRST116') {
            console.error(`Error checking capability: ${error.message}`);
            return false;
        }
        if (data) {
            // Check if capability has expired
            if (data.expires_at && new Date(data.expires_at) < new Date()) {
                return false;
            }
            return true;
        }
        // Check if user has the capability through role
        // TODO: Implement role-based capability checking
        return false;
    }
    /**
     * Check if a user has multiple capabilities (all must be true)
     */
    async checkCapabilities(userId, capabilityNames) {
        const results = await Promise.all(capabilityNames.map((cap) => this.checkCapability(userId, cap)));
        return results.every((result) => result === true);
    }
    /**
     * Check if a user has any of the given capabilities (at least one must be true)
     */
    async checkAnyCapability(userId, capabilityNames) {
        const results = await Promise.all(capabilityNames.map((cap) => this.checkCapability(userId, cap)));
        return results.some((result) => result === true);
    }
    /**
     * Get all capabilities for a user
     */
    async getUserCapabilities(userId) {
        const { data, error } = await this.supabase
            .from('user_capabilities')
            .select('capability_name, expires_at')
            .eq('user_id', userId);
        if (error) {
            console.error(`Error getting user capabilities: ${error.message}`);
            return [];
        }
        const capabilities = [];
        const now = new Date();
        for (const cap of data || []) {
            if (!cap.expires_at || new Date(cap.expires_at) > now) {
                capabilities.push(cap.capability_name);
            }
        }
        return capabilities;
    }
    /**
     * Get capabilities for a user in a specific category
     */
    async getUserCapabilitiesByCategory(userId, category) {
        const userCapabilities = await this.getUserCapabilities(userId);
        const categoryCapabilities = this.capabilityRegistry.getCapabilitiesByCategory(category);
        const categoryCapabilityNames = categoryCapabilities.map((cap) => cap.name);
        return userCapabilities.filter((cap) => categoryCapabilityNames.includes(cap));
    }
}
exports.CapabilityChecker = CapabilityChecker;
//# sourceMappingURL=CapabilityChecker.js.map