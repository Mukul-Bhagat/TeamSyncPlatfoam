"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitError = exports.IntegrationNotFoundError = exports.WebhookVerificationError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    code;
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.code = code;
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message) {
        super(message, 400, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class WebhookVerificationError extends AppError {
    constructor(message) {
        super(message, 401, 'WEBHOOK_VERIFICATION_FAILED');
        this.name = 'WebhookVerificationError';
    }
}
exports.WebhookVerificationError = WebhookVerificationError;
class IntegrationNotFoundError extends AppError {
    constructor(integrationName) {
        super(`Integration '${integrationName}' not found`, 404, 'INTEGRATION_NOT_FOUND');
        this.name = 'IntegrationNotFoundError';
    }
}
exports.IntegrationNotFoundError = IntegrationNotFoundError;
class RateLimitError extends AppError {
    constructor(message = 'Rate limit exceeded') {
        super(message, 429, 'RATE_LIMIT_EXCEEDED');
        this.name = 'RateLimitError';
    }
}
exports.RateLimitError = RateLimitError;
//# sourceMappingURL=errors.js.map