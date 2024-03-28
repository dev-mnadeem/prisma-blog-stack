import 'dotenv/config';

/** Bcrypt work factor. 10 keeps a sign-up under ~100ms on a laptop. */
const BCRYPT_ROUNDS = 10;
/** Average adult silent reading speed, used to label posts with a reading time. */
const WORDS_READ_PER_MINUTE = 200;
/** Excerpts are shown in the list view, where two lines of text is the budget. */
const EXCERPT_MAX_CHARS = 180;
const DEFAULT_PORT = 7231;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;
/** 12 hours, in seconds. Long enough for a session, short enough to expire. */
const DEFAULT_TOKEN_TTL_SECONDS = 12 * 60 * 60;

export type SummaryProviderName = 'local' | 'anthropic';

export interface AppConfig {
  readonly env: string;
  readonly port: number;
  readonly databaseUrl: string;
  readonly jwtSecret: string;
  readonly jwtTtlSeconds: number;
  readonly corsOrigins: string[];
  readonly bcryptRounds: number;
  readonly wordsReadPerMinute: number;
  readonly excerptMaxChars: number;
  readonly defaultPageSize: number;
  readonly maxPageSize: number;
  readonly summary: {
    readonly provider: SummaryProviderName;
    readonly anthropicApiKey?: string;
    readonly anthropicModel: string;
  };
}

class ConfigError extends Error {}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new ConfigError(`Missing required environment variable ${name}. Copy .env.sample to .env and fill it in.`);
  }
  return value;
}

function optionalInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    throw new ConfigError(`Environment variable ${name} must be an integer, got "${raw}".`);
  }
  return parsed;
}

function resolveSummaryProvider(): SummaryProviderName {
  const raw = (process.env.SUMMARY_PROVIDER ?? 'local').toLowerCase();
  if (raw !== 'local' && raw !== 'anthropic') {
    throw new ConfigError(`SUMMARY_PROVIDER must be "local" or "anthropic", got "${raw}".`);
  }
  return raw;
}

/**
 * Reads the whole environment once, at boot, so that nothing below this module
 * has to reach for `process.env` and guess at a default.
 */
export function loadConfig(): AppConfig {
  return {
    env: process.env.NODE_ENV ?? 'development',
    port: optionalInt('PORT', DEFAULT_PORT),
    databaseUrl: required('DATABASE_URL'),
    jwtSecret: required('JWT_SECRET'),
    jwtTtlSeconds: optionalInt('JWT_TTL_SECONDS', DEFAULT_TOKEN_TTL_SECONDS),
    corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:7232')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    bcryptRounds: optionalInt('BCRYPT_ROUNDS', BCRYPT_ROUNDS),
    wordsReadPerMinute: WORDS_READ_PER_MINUTE,
    excerptMaxChars: EXCERPT_MAX_CHARS,
    defaultPageSize: DEFAULT_PAGE_SIZE,
    maxPageSize: MAX_PAGE_SIZE,
    summary: {
      provider: resolveSummaryProvider(),
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      anthropicModel: process.env.ANTHROPIC_MODEL ?? 'claude-opus-5',
    },
  };
}

export const config = loadConfig();
