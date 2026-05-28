export declare class CoreActionRegistry {
    private static instance;
    private actionRegistry;
    private constructor();
    static getInstance(): CoreActionRegistry;
    /**
     * Register all core actions
     */
    registerCoreActions(): void;
    /**
     * Unregister all core actions
     */
    unregisterCoreActions(): void;
}
//# sourceMappingURL=CoreActionRegistry.d.ts.map