import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);

const contracts = {
  production: {
    file: '.env.production.example',
    required: [
      'NODE_ENV',
      'PORT',
      'API_PREFIX',
      'ALLOWED_ORIGINS',
      'MONGODB_URI',
      'MONGODB_DB_NAME',
      'JWT_SECRET',
      'JWT_ACCESS_EXPIRES_IN',
      'JWT_REFRESH_EXPIRES_IN',
      'GITHUB_TOKEN',
      'AI_ENABLED',
      'AI_PROVIDER',
      'AI_MODEL',
      'AI_BASE_URL',
      'GEMINI_API_KEY',
      'ENABLE_SWAGGER',
      'VITE_API_BASE_URL'
    ],
    allowed: [
      'NODE_ENV',
      'PORT',
      'API_PREFIX',
      'ALLOWED_ORIGINS',
      'MONGODB_URI',
      'MONGODB_DB_NAME',
      'JWT_SECRET',
      'JWT_ACCESS_EXPIRES_IN',
      'JWT_REFRESH_EXPIRES_IN',
      'GITHUB_TOKEN',
      'AI_ENABLED',
      'AI_PROVIDER',
      'AI_MODEL',
      'AI_BASE_URL',
      'GEMINI_API_KEY',
      'ENABLE_SWAGGER',
      'VITE_API_BASE_URL'
    ]
  },
  api: {
    file: 'apps/api/.env.example',
    required: [
      'NODE_ENV',
      'PORT',
      'API_PREFIX',
      'ALLOWED_ORIGINS',
      'MONGODB_URI',
      'MONGODB_DB_NAME',
      'JWT_SECRET',
      'JWT_ACCESS_EXPIRES_IN',
      'JWT_REFRESH_EXPIRES_IN',
      'GITHUB_TOKEN',
      'AI_ENABLED',
      'AI_PROVIDER',
      'AI_MODEL',
      'AI_BASE_URL',
      'GEMINI_API_KEY',
      'ENABLE_SWAGGER'
    ],
    allowed: [
      'NODE_ENV',
      'PORT',
      'API_PREFIX',
      'ALLOWED_ORIGINS',
      'MONGODB_URI',
      'MONGODB_DB_NAME',
      'JWT_SECRET',
      'JWT_ACCESS_EXPIRES_IN',
      'JWT_REFRESH_EXPIRES_IN',
      'GITHUB_TOKEN',
      'AI_ENABLED',
      'AI_PROVIDER',
      'AI_MODEL',
      'AI_BASE_URL',
      'GEMINI_API_KEY',
      'ENABLE_SWAGGER'
    ]
  },
  web: {
    file: 'apps/web/.env.example',
    required: ['VITE_API_BASE_URL'],
    allowed: ['VITE_API_BASE_URL']
  }
};

function parseEnvKeys(file) {
  const content = readFileSync(resolve(root, file), 'utf8');
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split('=')[0]?.trim())
    .filter(Boolean);
}

const errors = [];

for (const [name, contract] of Object.entries(contracts)) {
  const keys = parseEnvKeys(contract.file);
  const uniqueKeys = new Set(keys);
  const duplicateKeys = keys.filter((key, index) => keys.indexOf(key) !== index);
  const missingKeys = contract.required.filter((key) => !uniqueKeys.has(key));
  const unsupportedKeys = keys.filter((key) => !contract.allowed.includes(key));

  if (duplicateKeys.length > 0) {
    errors.push(`${name}: duplicate keys in ${contract.file}: ${Array.from(new Set(duplicateKeys)).join(', ')}`);
  }

  if (missingKeys.length > 0) {
    errors.push(`${name}: missing keys in ${contract.file}: ${missingKeys.join(', ')}`);
  }

  if (unsupportedKeys.length > 0) {
    errors.push(`${name}: unsupported keys in ${contract.file}: ${unsupportedKeys.join(', ')}`);
  }
}

if (errors.length > 0) {
  console.error('Environment contract check failed:\n');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('Environment contract check passed.');
