import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().optional().default('3000'),
  HOST: z.string().optional().default('0.0.0.0'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
  AI_PROVIDER: z.enum(['openai', 'gemini', 'claude']).optional().default('openai'),
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  CLAUDE_API_KEY: z.string().optional(),
  AI_MAX_TOKENS_PER_REQUEST: z.string().optional().default('4096'),
  AI_RATE_LIMIT_PER_MINUTE: z.string().optional().default('60'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
