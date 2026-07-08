import { IntegrationSettingsStatus } from '@devpulse/shared';
import { authService } from './auth-service';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

async function request<T>(path: string): Promise<T> {
  const token = authService.getAccessToken();

  if (!token) {
    throw new Error('No auth token found');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (payload as { message?: string })?.message ||
      `Request failed: ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  return payload as T;
}

export const settingsService = {
  getIntegrationStatus(): Promise<IntegrationSettingsStatus> {
    return request('/settings/integrations');
  }
};
