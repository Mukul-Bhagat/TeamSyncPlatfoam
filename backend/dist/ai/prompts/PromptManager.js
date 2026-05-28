"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptManager = void 0;
const path_1 = require("path");
class PromptManager {
    static prompts = new Map();
    static promptDir;
    static initialize(promptDir = (0, path_1.join)(__dirname, 'prompts')) {
        this.promptDir = promptDir;
    }
    static loadPrompt(promptName) {
        if (this.prompts.has(promptName)) {
            return this.prompts.get(promptName);
        }
        const promptPath = (0, path_1.join)(this.promptDir, `${promptName}.prompt.ts`);
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const promptModule = require(promptPath);
            const template = promptModule.default || promptModule;
            this.prompts.set(promptName, template);
            return template;
        }
        catch (error) {
            throw new Error(`Failed to load prompt: ${promptName}. Error: ${error}`);
        }
    }
    static composePrompt(promptName, variables = {}) {
        const template = this.loadPrompt(promptName);
        let userPrompt = template.userPromptTemplate;
        // Replace variables in the template
        for (const [key, value] of Object.entries(variables)) {
            userPrompt = userPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        return {
            systemPrompt: template.systemPrompt,
            userPrompt,
        };
    }
    static registerPrompt(name, template) {
        this.prompts.set(name, template);
    }
    static getAvailablePrompts() {
        return Array.from(this.prompts.keys());
    }
}
exports.PromptManager = PromptManager;
//# sourceMappingURL=PromptManager.js.map