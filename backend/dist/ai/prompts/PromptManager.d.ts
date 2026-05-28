export interface PromptTemplate {
    systemPrompt: string;
    userPromptTemplate: string;
    version: string;
}
export declare class PromptManager {
    private static prompts;
    private static promptDir;
    static initialize(promptDir?: string): void;
    static loadPrompt(promptName: string): PromptTemplate;
    static composePrompt(promptName: string, variables?: Record<string, string>): {
        systemPrompt: string;
        userPrompt: string;
    };
    static registerPrompt(name: string, template: PromptTemplate): void;
    static getAvailablePrompts(): string[];
}
//# sourceMappingURL=PromptManager.d.ts.map