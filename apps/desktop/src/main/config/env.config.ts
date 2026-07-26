import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from apps/api/.env and workspace root .env
config({ path: resolve(process.cwd(), 'apps/api/.env') });
config({ path: resolve(process.cwd(), '.env') });

export function resolveApiUrl(): string {
  const port = process.env.PORT || 3001;
  const rawPrefix = (process.env.API_PREFIX || 'api').trim().replace(/^\//, '').replace(/\/$/, '');
  const prefix = rawPrefix.startsWith('api/') ? rawPrefix : `api/${rawPrefix}`;

  let rawUrl = process.env.NEXT_PUBLIC_API_URL || process.env.EIGU_API_URL || `http://localhost:${port}`;
  rawUrl = rawUrl.replace(/\/$/, '');

  let baseHost = rawUrl.replace(/\/api\/.*$/, '').replace(/\/api$/, '');
  if (!baseHost) baseHost = `http://localhost:${port}`;

  return `${baseHost}/${prefix}`;
}

export function getApiConfig() {
  const port = process.env.PORT || 3001;
  const apiPrefix = process.env.API_PREFIX || 'api';
  const apiUrl = resolveApiUrl();
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `http://localhost:${port}`;
  return { apiUrl, wsUrl, apiPrefix, port };
}
