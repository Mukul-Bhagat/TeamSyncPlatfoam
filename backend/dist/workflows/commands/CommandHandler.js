"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCommandHandler = void 0;
class BaseCommandHandler {
    name;
    description;
    requiredCapability;
    constructor(name, description, requiredCapability) {
        this.name = name;
        this.description = description;
        this.requiredCapability = requiredCapability;
    }
    getSchema() {
        return {
            name: this.name,
            description: this.description,
            required_capability: this.requiredCapability,
            parameters: this.getParameters(),
        };
    }
    getRequiredCapability() {
        return this.requiredCapability;
    }
    createSuccessResult(data, executionId) {
        return {
            success: true,
            data,
            execution_id: executionId,
        };
    }
    createErrorResult(error) {
        return {
            success: false,
            error,
        };
    }
}
exports.BaseCommandHandler = BaseCommandHandler;
//# sourceMappingURL=CommandHandler.js.map