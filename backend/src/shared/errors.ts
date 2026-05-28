export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class WebhookVerificationError extends AppError {
  constructor(message: string) {
    super(message, 401, 'WEBHOOK_VERIFICATION_FAILED');
    this.name = 'WebhookVerificationError';
  }
}

export class IntegrationNotFoundError extends AppError {
  constructor(integrationName: string) {
    super(`Integration '${integrationName}' not found`, 404, 'INTEGRATION_NOT_FOUND');
    this.name = 'IntegrationNotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}
