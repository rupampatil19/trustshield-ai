/**
 * TrustShield AI - Cyber Resilience
 * API service layer
 *
 * Base URL resolution:
 *   Development (no VITE_API_URL):  relative paths -> Vite dev proxy forwards to localhost:8000
 *   Production  (VITE_API_URL set): absolute URL    -> direct call to deployed backend
 *
 * VITE_API_URL is baked in at build time by Vite. Changing it requires a redeploy.
 */

import axios, { AxiosError } from 'axios';
import type { URLScanResponse, MessageScanResponse } from '../types/api';

const API_ORIGIN = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') || '';

const API_BASE = API_ORIGIN ? `${API_ORIGIN}/api/v1/cyber` : '/api/v1/cyber';

const token = localStorage.getItem('ts_token');

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : '' },
});

export async function analyseURL(url: string): Promise<URLScanResponse> {
  try {
    const response = await apiClient.post<URLScanResponse>('/url-scans', { url });
    return response.data;
  } catch (error) {
    throw extractError(error, 'URL analysis failed');
  }
}

export async function analyseMessage(message: string): Promise<MessageScanResponse> {
  try {
    const response = await apiClient.post<MessageScanResponse>('/message-scans', { message });
    return response.data;
  } catch (error) {
    throw extractError(error, 'Message analysis failed');
  }
}

export async function getIncidentGuidance(
  indicatorCodes: string[],
  context: 'URL' | 'MESSAGE'
): Promise<any> {
  try {
    const response = await apiClient.post('/incident-guidance', {
      indicator_codes: indicatorCodes,
      context: context,
    });
    return response.data;
  } catch (error) {
    throw extractError(error, 'Incident guidance failed');
  }
}

export async function generateReport(scanType: 'url' | 'message', scanData: any): Promise<any> {
  try {
    const response = await apiClient.post('/generate-report', {
      scan_type: scanType,
      scan_data: scanData,
    });
    return response.data;
  } catch (error) {
    throw extractError(error, 'Report generation failed');
  }
}

/**
 * Run the video deepfake pipeline on an uploaded file.
 * Uses the base axios instance (not apiClient) so FormData can set its
 * own multipart boundary -- the JSON Content-Type on apiClient would break uploads.
 */
export async function scanDeepfakeVideo(file: File): Promise<any> {
  try {
    const form = new FormData();
    form.append('file', file);
    const response = await axios.post(
      `${API_ORIGIN}/api/v1/media/deepfake-scan`,
      form,
      { timeout: 120000 }
    );
    return response.data;
  } catch (error) {
    throw extractError(error, 'Deepfake scan failed');
  }
}

/** Health check used by the sidebar status indicator. */
export async function checkHealth(): Promise<boolean> {
  try {
    await axios.get(`${API_ORIGIN}/api/v1/health`, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/** Detailed health info for the Dashboard card. */
export async function getHealthDetail(): Promise<any> {
  const r = await axios.get(`${API_ORIGIN}/api/v1/health`, { timeout: 5000 });
  return r.data;
}

function extractError(error: unknown, fallback: string): Error {
  if (error instanceof AxiosError) {
    if (error.response) {
      const detail = error.response.data?.detail || error.response.data?.error;
      if (detail) {
        if (Array.isArray(detail)) {
          const messages = detail.map((d: { msg: string }) => d.msg).join('; ');
          return new Error('Validation error: ' + messages);
        }
        return new Error(String(detail));
      }
      return new Error(
        'Server error (' + error.response.status + '): ' + error.response.statusText
      );
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return new Error('Request timed out. Please try again.');
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      return new Error(
        'Cannot reach the backend server. Ensure FastAPI is running on http://localhost:8000.'
      );
    }
  }
  return new Error(fallback);
}