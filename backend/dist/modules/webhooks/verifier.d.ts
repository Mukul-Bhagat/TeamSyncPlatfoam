import type { IntegrationConfig } from '../../types';
export type AuthMethod = 'hmac' | 'api_key' | 'none';
export interface VerificationResult {
    valid: boolean;
    integration?: IntegrationConfig;
    error?: string;
}
export declare class WebhookVerifier {
    /**
     * Verify HMAC signature (GitHub-style)
     */
    static verifyHMAC(payload: string, signature: string, secret: string): boolean;
    /**
     * Verify API key from Authorization header
     */
    static verifyAPIKey(providedKey: string, expectedKey: string): boolean;
    /**
     * Verify webhook payload based on integration config
     */
    static verify(payload: string, headers: Record<string, string>, integration: IntegrationConfig): Promise<VerificationResult>;
    private static determineAuthMethod;
    /**
     * Extract signature from various header formats
     */
    static extractSignature(headers: Record<string, string>): string | null;
    /**
     * Validate timestamp to prevent replay attacks
     */
    static validateTimestamp(timestamp: string, maxAgeSeconds?: number): boolean;
}
//# sourceMappingURL=verifier.d.ts.map