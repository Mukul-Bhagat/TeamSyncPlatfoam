export declare class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    constructor(message: string, statusCode?: number, code?: string);
}
export declare class ValidationError extends AppError {
    constructor(message: string);
}
export declare class WebhookVerificationError extends AppError {
    constructor(message: string);
}
export declare class IntegrationNotFoundError extends AppError {
    constructor(integrationName: string);
}
export declare class RateLimitError extends AppError {
    constructor(message?: string);
}
//# sourceMappingURL=errors.d.ts.map