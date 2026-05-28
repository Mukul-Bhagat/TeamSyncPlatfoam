"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().optional().default('3000'),
    HOST: zod_1.z.string().optional().default('0.0.0.0'),
    SUPABASE_URL: zod_1.z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: zod_1.z.string().min(1),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).optional().default('development'),
    AI_PROVIDER: zod_1.z.enum(['openai', 'gemini', 'claude']).optional().default('openai'),
    OPENAI_API_KEY: zod_1.z.string().optional(),
    GEMINI_API_KEY: zod_1.z.string().optional(),
    CLAUDE_API_KEY: zod_1.z.string().optional(),
    AI_MAX_TOKENS_PER_REQUEST: zod_1.z.string().optional().default('4096'),
    AI_RATE_LIMIT_PER_MINUTE: zod_1.z.string().optional().default('60'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.format());
    process.exit(1);
}
exports.env = parsed.data;
//# sourceMappingURL=env.js.map