type EnvMap = NodeJS.ProcessEnv;

const productionRequiredKeys = [
  'MONGODB_URI',
  'MONGODB_DB_NAME',
  'JWT_SECRET',
  'ALLOWED_ORIGINS'
];

const supportedAiProviders = ['none', 'ollama', 'gemini'];

export function isTruthy(value?: string) {
  return ['1', 'true', 'yes', 'on'].includes((value || '').toLowerCase());
}

function getTrimmed(env: EnvMap, key: string) {
  return env[key]?.trim() || '';
}

export function validateEnvironment(env: EnvMap) {
  const isProduction = env.NODE_ENV === 'production';
  const aiEnabled = isTruthy(env.AI_ENABLED);
  const aiProvider = (env.AI_PROVIDER || 'none').toLowerCase();

  if (!supportedAiProviders.includes(aiProvider)) {
    if (isProduction) {
      throw new Error(
        `Unsupported AI_PROVIDER "${env.AI_PROVIDER}". Use one of: ${supportedAiProviders.join(', ')}.`
      );
    }

    return;
  }

  if (aiEnabled && aiProvider === 'gemini' && !getTrimmed(env, 'GEMINI_API_KEY')) {
    throw new Error('GEMINI_API_KEY is required when AI_ENABLED=true and AI_PROVIDER=gemini.');
  }

  if (aiEnabled && aiProvider === 'ollama' && !getTrimmed(env, 'AI_BASE_URL')) {
    env.AI_BASE_URL = 'http://localhost:11434';
  }

  if (!isProduction) {
    return;
  }

  const missing = productionRequiredKeys.filter((key) => !getTrimmed(env, key));

  if (missing.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(', ')}`
    );
  }

  const allowedOrigins = getTrimmed(env, 'ALLOWED_ORIGINS');

  if (allowedOrigins.includes('*') || allowedOrigins.includes('localhost')) {
    throw new Error(
      'ALLOWED_ORIGINS must contain deployed frontend origins only in production.'
    );
  }

  if (getTrimmed(env, 'JWT_SECRET').length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production.');
  }
}
