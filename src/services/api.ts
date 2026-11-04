/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Load, MarketSummary, CountyMarketMetric, Booking, EscrowDetails, User } from '../types.ts';

const TOKEN_KEY = 'kenyload_jwt_token';
const USER_KEY = 'kenyload_user_profile';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null): void {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<{
  success: boolean;
  status: number;
  data?: T;
  error?: string;
  message?: string;
  rawJson?: any;
}> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        error: json.error || 'RequestFailed',
        message: json.message || `HTTP ${res.status}: ${res.statusText}`,
        rawJson: json,
      };
    }

    return {
      success: true,
      status: res.status,
      data: (json.data ?? json) as T,
      rawJson: json,
    };
  } catch (err: unknown) {
    const error = err as Error;
    return {
      success: false,
      status: 0,
      error: 'NetworkError',
      message: error.message || 'Failed to connect to backend server',
    };
  }
}

// 1. Public Market Endpoints
export async function fetchMarketSummary() {
  return apiRequest<MarketSummary>('/api/v1/market-summary');
}

export async function fetchCountyHeatmaps() {
  return apiRequest<CountyMarketMetric[]>('/api/v1/heatmaps');
}

// 2. Demo Persona & Auth
export async function fetchDemoTokens() {
  return apiRequest<Record<string, { label: string; user: User; token: string; description: string }>>(
    '/api/v1/auth/demo-tokens'
  );
}

// 3. Protected Load Endpoints
export async function fetchLoads(filter?: {
  equipmentType?: string;
  originCounty?: string;
  destinationCounty?: string;
  minBudget?: number;
}) {
  const params = new URLSearchParams();
  if (filter?.equipmentType && filter.equipmentType !== 'ALL') params.set('equipmentType', filter.equipmentType);
  if (filter?.originCounty) params.set('originCounty', filter.originCounty);
  if (filter?.destinationCounty) params.set('destinationCounty', filter.destinationCounty);
  if (filter?.minBudget) params.set('minBudget', String(filter.minBudget));

  const url = `/api/v1/loads${params.toString() ? `?${params.toString()}` : ''}`;
  return apiRequest<Load[]>(url);
}

export async function createLoad(loadData: Partial<Load>) {
  return apiRequest<Load>('/api/v1/loads', {
    method: 'POST',
    body: JSON.stringify(loadData),
  });
}

// 4. Bookings & Escrow
export async function createBooking(data: { loadId: string; finalAgreedPrice?: number; driverName?: string; driverPhone?: string }) {
  return apiRequest<Booking>('/api/v1/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function initiateEscrow(data: { bookingId: string; shipperPhone?: string; amountKes?: number }) {
  return apiRequest<{
    escrow: any;
    safaricomResponse: any;
  }>('/api/v1/escrow/initiate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function releaseEscrow(data: { bookingId: string; otpCode: string; epodImageUrl?: string; remarks?: string }) {
  return apiRequest<{
    disbursement: any;
  }>('/api/v1/escrow/release', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchEscrowStatus(bookingId: string) {
  return apiRequest<EscrowDetails>(`/api/v1/escrow/status/${bookingId}`);
}
