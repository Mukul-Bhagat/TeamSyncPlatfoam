"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookVerifier = void 0;
const crypto_1 = require("crypto");
class WebhookVerifier {
    /**
     * Verify HMAC signature (GitHub-style)
     */
    static verifyHMAC(payload, signature, secret) {
        try {
            const expectedSignature = (0, crypto_1.createHmac)('sha256', secret)
                .update(payload)
                .digest('hex');
            // Compare signatures safely
            const signatureBuffer = Buffer.from(signature);
            const expectedBuffer = Buffer.from(expectedSignature);
            if (signatureBuffer.length !== expectedBuffer.length) {
                return false;
            }
            return (0, crypto_1.timingSafeEqual)(signatureBuffer, expectedBuffer);
        }
        catch (error) {
            console.error('HMAC verification error:', error);
            return false;
        }
    }
    /**
     * Verify API key from Authorization header
     */
    static verifyAPIKey(providedKey, expectedKey) {
        return providedKey === expectedKey;
    }
    /**
     * Verify webhook payload based on integration config
     */
    static async verify(payload, headers, integration) {
        try {
            // Determine auth method based on integration config
            const authMethod = this.determineAuthMethod(integration);
            switch (authMethod) {
                case 'hmac':
                    if (!integration.webhook_secret) {
                        return {
                            valid: false,
                            error: 'Webhook secret not configured for HMAC verification',
                        };
                    }
                    const signature = headers['x-hub-signature-256'] || headers['x-signature'];
                    if (!signature) {
                        return {
                            valid: false,
                            error: 'Missing signature header',
                        };
                    }
                    // Remove 'sha256=' prefix if present
                    const signatureValue = signature.startsWith('sha256=')
                        ? signature.substring(7)
                        : signature;
                    const hmacValid = this.verifyHMAC(payload, signatureValue, integration.webhook_secret);
                    if (!hmacValid) {
                        return {
                            valid: false,
                            error: 'Invalid HMAC signature',
                        };
                    }
                    return { valid: true, integration };
                case 'api_key':
                    if (!integration.api_key) {
                        return {
                            valid: false,
                            error: 'API key not configured',
                        };
                    }
                    const authHeader = headers['authorization'];
                    if (!authHeader) {
                        return {
                            valid: false,
                            error: 'Missing Authorization header',
                        };
                    }
                    // Extract Bearer token
                    const providedKey = authHeader.startsWith('Bearer ')
                        ? authHeader.substring(7)
                        : authHeader;
                    const apiKeyValid = this.verifyAPIKey(providedKey, integration.api_key);
                    if (!apiKeyValid) {
                        return {
                            valid: false,
                            error: 'Invalid API key',
                        };
                    }
                    return { valid: true, integration };
                case 'none':
                    // No verification required
                    return { valid: true, integration };
                default:
                    return {
                        valid: false,
                        error: 'Unknown authentication method',
                    };
            }
        }
        catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'Verification failed',
            };
        }
    }
    static determineAuthMethod(integration) {
        if (integration.webhook_secret) {
            return 'hmac';
        }
        if (integration.api_key) {
            return 'api_key';
        }
        return 'none';
    }
    /**
     * Extract signature from various header formats
     */
    static extractSignature(headers) {
        const signatureHeaders = [
            'x-hub-signature-256',
            'x-signature',
            'x-webhook-signature',
            'signature',
        ];
        for (const header of signatureHeaders) {
            const value = headers[header];
            if (value) {
                return value;
            }
        }
        return null;
    }
    /**
     * Validate timestamp to prevent replay attacks
     */
    static validateTimestamp(timestamp, maxAgeSeconds = 300) {
        try {
            const eventTime = new Date(timestamp).getTime();
            const currentTime = Date.now();
            const ageSeconds = (currentTime - eventTime) / 1000;
            return ageSeconds <= maxAgeSeconds && ageSeconds >= 0;
        }
        catch {
            return false;
        }
    }
}
exports.WebhookVerifier = WebhookVerifier;
//# sourceMappingURL=verifier.js.map